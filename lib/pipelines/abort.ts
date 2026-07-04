import 'server-only';
import { logger } from '@/lib/logger';
import { classifyLLMError, isTerminalReason, PipelineCancelledError } from './errors';
import type { PipelineAbortReason, PipelineRunContext } from './shared/types';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/db';

const log = logger.child('pipelines:abort');

/**
 * Abortable sleep. Resolves after `ms` or rejects early if `signal` is aborted.
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    const onAbort = () => {
      clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Combine multiple AbortSignals into one. The combined signal aborts when any
 * input signal aborts.
 */
export function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener(
      'abort',
      () => controller.abort(signal.reason),
      { once: true }
    );
  }

  return controller.signal;
}

/**
 * Build a PipelineRunContext for a pipeline execution.
 */
export function buildRunContext(opts: {
  pipelineId: string;
  businessId: string;
  pipelineType: 'weather' | 'competitor';
  controller: AbortController;
}): PipelineRunContext {
  const { pipelineId, businessId, pipelineType, controller } = opts;

  return {
    pipelineId,
    businessId,
    pipelineType,
    signal: controller.signal,

    async abort(reason: PipelineAbortReason) {
      if (!controller.signal.aborted) {
        controller.abort(reason);
      }

      const cancelKey = `pipeline:cancel:${pipelineId}`;
      await redis.set(cancelKey, reason, 'EX', 600);

      await prisma.agentRun.updateMany({
        where: {
          pipelineId,
          status: { in: ['pending', 'running'] },
        },
        data: {
          status: 'failed',
          error: `Pipeline aborted: ${reason}`,
          completedAt: new Date(),
        },
      });

      log.info('pipeline aborted', { pipelineId, reason });
    },

    async throwIfCancelled() {
      const reason = await redis.get(`pipeline:cancel:${pipelineId}`);
      if (reason) {
        throw new PipelineCancelledError(
          (reason as PipelineAbortReason) || 'user_cancelled'
        );
      }
    },
  };
}

/**
 * Run multiple tasks in parallel with abort awareness. If any task fails with
 * a terminal error (rate limit, quota, user cancel), the combined signal is
 * aborted and remaining tasks stop.
 */
export async function runAbortableParallel<T>(
  ctx: PipelineRunContext,
  tasks: Array<(ctx: PipelineRunContext) => Promise<T>>
): Promise<T[]> {
  const groupController = new AbortController();

  const combinedSignal = anySignal([ctx.signal, groupController.signal]);

  const childCtx: PipelineRunContext = {
    ...ctx,
    signal: combinedSignal,
    abort: async (reason) => {
      if (!groupController.signal.aborted) {
        groupController.abort(reason);
      }
      await ctx.abort(reason);
    },
  };

  const wrapped = tasks.map((task) =>
    task(childCtx).catch(async (err) => {
      const reason = classifyLLMError(err);

      if (isTerminalReason(reason)) {
        groupController.abort(reason);
        await ctx.abort(reason);
      }

      throw err;
    })
  );

  const settled = await Promise.allSettled(wrapped);

  const rejected = settled.find(
    (item): item is PromiseRejectedResult => item.status === 'rejected'
  );

  if (rejected) {
    throw rejected.reason;
  }

  return settled.map((item) => {
    if (item.status === 'fulfilled') return item.value;
    throw item.reason;
  });
}

/**
 * Run heterogeneous tasks in parallel with abort awareness.
 * Like runAbortableParallel but preserves individual return types as a tuple.
 */
export async function runAbortableTuple<T extends Array<(ctx: PipelineRunContext) => Promise<unknown>>>(
  ctx: PipelineRunContext,
  tasks: T
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const groupController = new AbortController();

  const combinedSignal = anySignal([ctx.signal, groupController.signal]);

  const childCtx: PipelineRunContext = {
    ...ctx,
    signal: combinedSignal,
    abort: async (reason) => {
      if (!groupController.signal.aborted) {
        groupController.abort(reason);
      }
      await ctx.abort(reason);
    },
  };

  const wrapped = tasks.map((task) =>
    task(childCtx).catch(async (err) => {
      const reason = classifyLLMError(err);

      if (isTerminalReason(reason)) {
        groupController.abort(reason);
        await ctx.abort(reason);
      }

      throw err;
    })
  );

  const settled = await Promise.allSettled(wrapped);

  const rejected = settled.find(
    (item): item is PromiseRejectedResult => item.status === 'rejected'
  );

  if (rejected) {
    throw rejected.reason;
  }

  return settled.map((item) => {
    if (item.status === 'fulfilled') return item.value;
    throw item.reason;
  }) as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
}
