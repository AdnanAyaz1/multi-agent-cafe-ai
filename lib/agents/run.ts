import 'server-only';
import { generateText } from 'ai';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { isPipelineCancelled } from '@/lib/pipelines/cancel';
import { PipelineCancelledError, PipelineTerminalError, classifyLLMError } from '@/lib/pipelines/errors';
import { sleep as abortableSleep } from '@/lib/pipelines/abort';
import type { AgentRunArgs, AgentRunResult } from './types';
import {
  parseJsonFromText,
  markFailed,
  buildRateLimitMessage,
  parseRetryAfter,
} from './utils';

export type { AgentRunArgs, AgentRunResult };

const log = logger.child('agents');

/**
 * Runs a single agent step:
 *  1. Insert AgentRun row (status: running)
 *  2. Call generateText with JSON mode, parse with schema
 *  3. On success: update row (status: complete, output, duration, tokens)
 *  4. On failure: update row (status: failed, error), throw AgentError
 *
 * The agent respects the pipeline's AbortSignal:
 *  - Sleep between calls is abortable
 *  - generateText receives the signal so in-flight LLM calls can be cancelled
 *  - Rate limit errors immediately abort the whole pipeline
 */
export async function withAgentRun<Output>(
  args: AgentRunArgs<Output>
): Promise<AgentRunResult<Output>> {
  const startedAt = new Date();
  const start = Date.now();
  const signal = args.context.signal;

  const run = await prisma.agentRun.create({
    data: {
      pipelineId: args.context.pipelineId,
      agentName: args.agentName,
      status: 'running',
      input: args.inputSnapshot
        ? (JSON.parse(JSON.stringify(args.inputSnapshot)) as object)
        : undefined,
      startedAt,
    },
  });

  const maxAttempts = (args.retries ?? 0) + 1;
  let lastError: unknown;

  // Rate limit guard: wait between agent calls to stay under free-tier RPM
  // Sleep is abortable — if the pipeline is cancelled during the wait, we stop immediately.
  try {
    await abortableSleep(3500, signal);
  } catch (e) {
    if (signal?.aborted) {
      await markFailed(run.id, start, 'Pipeline cancelled by user');
      throw new PipelineCancelledError('user_cancelled');
    }
    throw e;
  }

  // Check if the pipeline was cancelled while we were sleeping
  if (signal?.aborted || (await isPipelineCancelled(args.context.pipelineId))) {
    await markFailed(run.id, start, 'Pipeline cancelled by user');
    throw new PipelineCancelledError('user_cancelled');
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await generateText({
        model: args.model,
        instructions: args.instructions,
        prompt: args.prompt,
        maxRetries: 0,
        abortSignal: signal,
      });

      const parsed = parseJsonFromText(result.text);
      const validated = args.schema.parse(parsed);

      const durationMs = Date.now() - start;
      const tokenCount = result.usage?.totalTokens ?? 0;

      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: 'complete',
          output: JSON.parse(JSON.stringify(validated)) as object,
          durationMs,
          tokenCount,
          completedAt: new Date(),
        },
      });

      log.info(`${args.agentName} ok`, {
        pipelineId: args.context.pipelineId,
        runId: run.id,
        durationMs,
        tokens: tokenCount,
        attempt,
      });

      return {
        agentRunId: run.id,
        output: validated,
        durationMs,
        tokenCount,
      };
    } catch (e) {
      lastError = e;

      const reason = classifyLLMError(e);

      // --- Abort signal fired: pipeline is being cancelled/aborted ---
      if (signal?.aborted) {
        await markFailed(run.id, start, `Pipeline aborted: ${reason}`);
        throw new PipelineCancelledError(reason);
      }

      // --- Rate limit: wait and retry (Groq 429s are temporary) ---
      if (reason === 'rate_limit') {
        const retryAfter = parseRetryAfter(e);
        log.warn(`${args.agentName} rate limited, retrying in ${retryAfter}s`, {
          pipelineId: args.context.pipelineId,
          runId: run.id,
        });
        if (attempt < maxAttempts) {
          try {
            await abortableSleep(retryAfter * 1000, signal);
          } catch {
            if (signal?.aborted) {
              await markFailed(run.id, start, 'Pipeline cancelled by user');
              throw new PipelineCancelledError('user_cancelled');
            }
          }
        }
        continue; // retry the loop
      }

      // --- Quota exceeded: terminal, abort pipeline ---
      if (reason === 'quota_exceeded') {
        const msg = 'API quota exceeded. Please wait a few minutes and try again.';
        log.error(`${args.agentName} quota_exceeded`, e, {
          pipelineId: args.context.pipelineId,
          runId: run.id,
        });
        await markFailed(run.id, start, msg);
        throw new PipelineTerminalError(reason, msg);
      }

      // --- Pipeline cancelled: check Redis flag, fail immediately ---
      if (await isPipelineCancelled(args.context.pipelineId)) {
        await markFailed(run.id, start, 'Pipeline cancelled by user');
        throw new PipelineCancelledError('user_cancelled');
      }

      log.warn(`${args.agentName} attempt ${attempt}/${maxAttempts} failed`, {
        pipelineId: args.context.pipelineId,
        runId: run.id,
        error: e instanceof Error ? e.message : String(e),
      });
      if (attempt < maxAttempts) {
        try {
          await abortableSleep(800 * attempt, signal);
        } catch {
          if (signal?.aborted) {
            await markFailed(run.id, start, 'Pipeline cancelled by user');
            throw new PipelineCancelledError('user_cancelled');
          }
        }
      }
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'Agent failed';
  await markFailed(run.id, start, message);

  log.error(`${args.agentName} exhausted retries`, lastError, {
    pipelineId: args.context.pipelineId,
    runId: run.id,
  });

  throw message;
}
