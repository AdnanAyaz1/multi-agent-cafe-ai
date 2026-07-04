import 'server-only';
import { generateText } from 'ai';
import type { LanguageModel } from 'ai';
import type { ZodType } from 'zod';
import { UnrecoverableError } from 'bullmq';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { isPipelineCancelled } from '@/lib/pipelines/cancel';
import type { AgentName, PipelineContext } from './types';

const log = logger.child('agents');

export interface AgentRunArgs<Output> {
  agentName: AgentName;
  model: LanguageModel;
  instructions: string;
  prompt: string;
  schema: ZodType<Output>;
  schemaName: string;
  context: PipelineContext;
  /** Optional structured input echoed into the AgentRun row for debugging. */
  inputSnapshot?: unknown;
  /** Defaults to 0 (no retry). Total attempts = retries + 1. */
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
 *  2. Call generateText with JSON mode, parse with schema
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

  // Rate limit guard: wait between agent calls to stay under free-tier RPM
  await sleep(2500);

  // Check if the pipeline was cancelled while we were sleeping
  if (await isPipelineCancelled(args.context.pipelineId)) {
    await markFailed(run.id, start, 'Pipeline cancelled by user');
    throw 'Pipeline cancelled by user';
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await generateText({
        model: args.model,
        instructions: args.instructions,
        prompt: args.prompt,
        maxRetries: 0,
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

      // --- Rate limit: fail immediately, no retry ---
      if (isRateLimitError(e)) {
        log.error(`${args.agentName} rate limited`, e, {
          pipelineId: args.context.pipelineId,
          runId: run.id,
        });
        const msg = buildRateLimitMessage(e);
        await markFailed(run.id, start, msg);
        throw new UnrecoverableError(msg);
      }

      // --- Pipeline cancelled: check Redis flag, fail immediately ---
      if (await isPipelineCancelled(args.context.pipelineId)) {
        await markFailed(run.id, start, 'Pipeline cancelled by user');
        throw 'Pipeline cancelled by user';
      }

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
  await markFailed(run.id, start, message);

  log.error(`${args.agentName} exhausted retries`, lastError, {
    pipelineId: args.context.pipelineId,
    runId: run.id,
  });

  throw message;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function markFailed(runId: string, start: number, error: string): Promise<void> {
  await prisma.agentRun.update({
    where: { id: runId },
    data: {
      status: 'failed',
      error,
      durationMs: Date.now() - start,
      completedAt: new Date(),
    },
  });
}

/**
 * Detect HTTP 429 / rate-limit errors from any LLM provider.
 * The Vercel AI SDK wraps provider errors in various shapes, so we check
 * multiple properties to be thorough.
 */
function isRateLimitError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;

  const msg = (err.message ?? '').toLowerCase();
  const name = (err.name ?? '').toLowerCase();

  // Direct message patterns
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('rate_limit')) return true;
  if (msg.includes('quota exceeded') || msg.includes('resource_exhausted')) return true;
  if (msg.includes('too many requests') || msg.includes('requests per minute')) return true;

  // Error name patterns
  if (name.includes('ratelimit') || name.includes('rate-limit')) return true;

  // Check nested response/statusCode properties (Vercel AI SDK / Google AI)
  const anyErr = err as unknown as Record<string, unknown>;
  const status = anyErr.statusCode ?? anyErr.status ?? anyErr.status_code;
  if (status === 429) return true;

  // Check nested response object
  const resp = anyErr.response as Record<string, unknown> | undefined;
  if (resp?.status === 429) return true;

  // Check cause chain
  const cause = anyErr.cause;
  if (cause instanceof Error && isRateLimitError(cause)) return true;
  if (cause && typeof cause === 'object') {
    const c = cause as Record<string, unknown>;
    if (c.statusCode === 429 || c.status === 429) return true;
    const cMsg = String(c.message ?? '').toLowerCase();
    if (cMsg.includes('429') || cMsg.includes('rate limit') || cMsg.includes('quota')) return true;
  }

  return false;
}

function buildRateLimitMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  // Try to extract a meaningful provider message
  const anyErr = err as Record<string, unknown>;
  const resp = anyErr.response as Record<string, unknown> | undefined;
  const body = resp?.body as Record<string, unknown> | undefined;

  if (body && typeof body === 'object') {
    const detail = (body as Record<string, unknown>).error ?? body;
    if (detail && typeof detail === 'object') {
      const d = detail as Record<string, unknown>;
      if (d.message) return `Rate limit: ${d.message}`;
      if (d.reason) return `Rate limit: ${d.reason}`;
    }
  }

  // Fall back to a user-friendly message
  if (raw.toLowerCase().includes('quota')) {
    return 'API quota exceeded. Please wait a few minutes and try again.';
  }
  return 'Rate limit exceeded. Please wait a moment and try again.';
}

/**
 * Strips markdown formatting and extracts JSON from model responses.
 * Handles: ```json code blocks, **bold** markers, leading/trailing text.
 */
function parseJsonFromText(text: string): unknown {
  let cleaned = text.trim();

  // Strip ```json ... ``` code fences
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // Strip markdown bold: **text** → text
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');

  // Strip markdown italic: *text* → text
  cleaned = cleaned.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '$1');

  // Try to find a JSON object/array in the text
  const jsonStart = cleaned.search(/[\[{]/);
  const jsonEnd = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
  }

  return JSON.parse(cleaned);
}
