import { generateObject } from 'ai';
import type { LanguageModel } from 'ai';
import type { ZodType } from 'zod';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { AgentError } from '@/lib/errors';
import type { AgentName, PipelineContext } from './types';

const log = logger.child('agents');

export interface AgentRunArgs<Output> {
  agentName: AgentName;
  model: LanguageModel;
  system: string;
  prompt: string;
  schema: ZodType<Output>;
  schemaName: string;
  context: PipelineContext;
  /** Optional structured input echoed into the AgentRun row for debugging. */
  inputSnapshot?: unknown;
  /** Defaults to 1 (no retry). Total attempts = retries + 1. */
  retries?: number;
}

export interface AgentRunResult<Output> {
  agentRunId: string;
  output: Output;
  durationMs: number;
  tokenCount: number;
}

/**
 * Runs a single agent step:
 *  1. Insert AgentRun row (status: running)
 *  2. Call generateObject with schema
 *  3. On success: update row (status: complete, output, duration, tokens)
 *  4. On failure: update row (status: failed, error), throw AgentError
 */
export async function withAgentRun<Output>(
  args: AgentRunArgs<Output>
): Promise<AgentRunResult<Output>> {
  const startedAt = new Date();
  const start = Date.now();

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

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await generateObject({
        model: args.model,
        system: args.system,
        prompt: args.prompt,
        schema: args.schema,
        schemaName: args.schemaName,
      });

      const durationMs = Date.now() - start;
      const tokenCount = result.usage?.totalTokens ?? 0;

      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: 'complete',
          output: JSON.parse(JSON.stringify(result.object)) as object,
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
        output: result.object,
        durationMs,
        tokenCount,
      };
    } catch (e) {
      lastError = e;
      log.warn(`${args.agentName} attempt ${attempt}/${maxAttempts} failed`, {
        pipelineId: args.context.pipelineId,
        runId: run.id,
        error: e instanceof Error ? e.message : String(e),
      });
      if (attempt < maxAttempts) {
        await sleep(800 * attempt);
      }
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'Agent failed';
  await prisma.agentRun.update({
    where: { id: run.id },
    data: {
      status: 'failed',
      error: message,
      durationMs: Date.now() - start,
      completedAt: new Date(),
    },
  });

  log.error(`${args.agentName} exhausted retries`, lastError, {
    pipelineId: args.context.pipelineId,
    runId: run.id,
  });

  throw new AgentError(`${args.agentName} failed: ${message}`, {
    agentName: args.agentName,
    pipelineId: args.context.pipelineId,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
