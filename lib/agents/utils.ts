/**
 * Agent utilities: JSON parsing, rate-limit detection, failure helpers.
 *
 * These are pure helpers with no side-effects (aside from the DB write in
 * `markFailed`). They are kept separate from the core `withAgentRun` flow
 * so that orchestration logic stays readable.
 */

import 'server-only';
import { prisma } from '@/lib/db';

/**
 * Strips markdown formatting and extracts JSON from model responses.
 * Handles: ```json code fences, **bold** markers, leading/trailing text.
 */
export function parseJsonFromText(text: string): unknown {
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

/**
 * Mark an AgentRun row as failed in the database.
 */
export async function markFailed(runId: string, start: number, error: string): Promise<void> {
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
export function isRateLimitError(err: unknown): boolean {
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

/**
 * Build a user-friendly rate-limit message from an error.
 */
export function buildRateLimitMessage(err: unknown): string {
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
