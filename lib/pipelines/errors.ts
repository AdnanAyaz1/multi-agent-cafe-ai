import 'server-only';
import type { PipelineAbortReason } from './shared/types';

export type { PipelineAbortReason };

export class PipelineCancelledError extends Error {
  public readonly reason: PipelineAbortReason;

  constructor(reason: PipelineAbortReason = 'user_cancelled') {
    super(`Pipeline cancelled: ${reason}`);
    this.name = 'PipelineCancelledError';
    this.reason = reason;
  }
}

export class PipelineTerminalError extends Error {
  public readonly reason: PipelineAbortReason;

  constructor(reason: PipelineAbortReason, message?: string) {
    super(message ?? `Pipeline terminal: ${reason}`);
    this.name = 'PipelineTerminalError';
    this.reason = reason;
  }
}

/**
 * Classify an LLM/agent error into a pipeline abort reason.
 */
export function classifyLLMError(err: unknown): PipelineAbortReason {
  if (err instanceof PipelineCancelledError) return err.reason;
  if (err instanceof PipelineTerminalError) return err.reason;

  if (typeof err === 'string' && err.includes('cancelled')) return 'user_cancelled';

  if (err instanceof Error) {
    const msg = (err.message ?? '').toLowerCase();
    const name = (err.name ?? '').toLowerCase();

    if (name === 'aborterror' || name === 'abort') return 'user_cancelled';

    if (msg.includes('quota exceeded') || msg.includes('billing error') || msg.includes('token limit exceeded')) {
      return 'quota_exceeded';
    }

    if (
      msg.includes('429') ||
      msg.includes('rate limit') ||
      msg.includes('rate_limit') ||
      msg.includes('too many requests') ||
      msg.includes('requests per minute') ||
      msg.includes('resource_exhausted')
    ) {
      return 'rate_limit';
    }

    const anyErr = err as unknown as Record<string, unknown>;
    const status = anyErr.statusCode ?? anyErr.status ?? anyErr.status_code;
    if (status === 429) return 'rate_limit';

    const cause = anyErr.cause;
    if (cause instanceof Error) {
      const causeClassified = classifyLLMError(cause);
      if (causeClassified !== 'pipeline_failed') return causeClassified;
    }
    if (cause && typeof cause === 'object') {
      const c = cause as unknown as Record<string, unknown>;
      if (c.statusCode === 429 || c.status === 429) return 'rate_limit';
      const cMsg = String(c.message ?? '').toLowerCase();
      if (cMsg.includes('quota')) return 'quota_exceeded';
      if (cMsg.includes('429') || cMsg.includes('rate limit')) return 'rate_limit';
    }
  }

  return 'pipeline_failed';
}

/**
 * Check if an error reason should abort the entire pipeline immediately.
 */
export function isTerminalReason(reason: PipelineAbortReason): boolean {
  return reason === 'rate_limit' || reason === 'quota_exceeded' || reason === 'user_cancelled';
}
