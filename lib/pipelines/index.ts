import 'server-only';
import { logger } from '@/lib/logger';
import { runWeatherPipeline } from '@/lib/pipelines/weather';
import { runCompetitorPipeline } from '@/lib/pipelines/competitor';
import { getPipelineCancelReason } from '@/lib/pipelines/cancel';
import { PipelineCancelledError } from '@/lib/pipelines/errors';
import { buildRunContext } from '@/lib/pipelines/abort';
import type { PipelineRunContext } from '@/lib/pipelines/shared/types';
import type { PipelineResult, PipelineType } from '@/lib/pipelines/shared/types';
import { redis } from '@/lib/redis';

const log = logger.child('pipelines');

export type { PipelineRunContext, PipelineResult, PipelineType };

/**
 * Start watching Redis for a cancellation signal. When detected, abort the
 * controller and stop watching. This bridges the gap between the Redis flag
 * (set by the DELETE endpoint) and the in-memory AbortController.
 */
function watchForCancellation(
  pipelineId: string,
  controller: AbortController
): { stop: () => void } {
  const key = `pipeline:cancel:${pipelineId}`;
  const checkInterval = 2000; // check every 2s

  const interval = setInterval(async () => {
    try {
      if (controller.signal.aborted) {
        clearInterval(interval);
        return;
      }
      const reason = await redis.get(key);
      if (reason && !controller.signal.aborted) {
        controller.abort(reason as string);
        clearInterval(interval);
      }
    } catch {
      // Redis read error — ignore, will check again next interval
    }
  }, checkInterval);

  return {
    stop: () => clearInterval(interval),
  };
}

/**
 * Run a pipeline with full abort support.
 *
 * Creates an AbortController for the pipeline lifetime. The controller is
 * aborted when:
 *  - A terminal error occurs (rate limit, quota exceeded)
 *  - The Redis cancellation flag is detected
 *  - Any agent step throws a PipelineCancelledError
 *
 * A Redis watcher monitors for the cancel flag every 2s and aborts the
 * controller when detected, ensuring in-flight LLM calls receive the abort
 * signal promptly.
 */
export async function runPipeline(
  context: { pipelineId: string; businessId: string; pipelineType: PipelineType }
): Promise<PipelineResult> {
  log.info('dispatching pipeline', {
    pipelineId: context.pipelineId,
    pipelineType: context.pipelineType,
    businessId: context.businessId,
  });

  // Check if already cancelled before starting
  const existingReason = await getPipelineCancelReason(context.pipelineId);
  if (existingReason) {
    throw new PipelineCancelledError(existingReason);
  }

  // Create one AbortController for the entire pipeline lifetime
  const controller = new AbortController();
  const ctx: PipelineRunContext = buildRunContext({
    ...context,
    controller,
  });

  // Start watching Redis for cancellation signals from the DELETE endpoint
  const cancelWatcher = watchForCancellation(context.pipelineId, controller);

  try {
    let result: PipelineResult;

    switch (context.pipelineType) {
      case 'weather':
        result = await runWeatherPipeline(ctx);
        break;
      case 'competitor':
        result = await runCompetitorPipeline(ctx);
        break;
      default:
        throw new Error(`Unknown pipeline type: ${context.pipelineType}`);
    }

    return result;
  } catch (error) {
    // On any terminal error, ensure the pipeline is fully aborted
    if (!controller.signal.aborted) {
      const { classifyLLMError, isTerminalReason } = await import('@/lib/pipelines/errors');
      const reason = classifyLLMError(error);
      if (isTerminalReason(reason)) {
        await ctx.abort(reason);
      }
    }
    throw error;
  } finally {
    cancelWatcher.stop();
  }
}
