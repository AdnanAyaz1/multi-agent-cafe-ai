import 'server-only';
import { Worker, type Job, UnrecoverableError } from 'bullmq';
import { runPipeline } from '@/lib/pipelines';
import { logger } from '@/lib/logger';
import { redisConnection } from '@/lib/queues/connection';
import { isPipelineCancelled, clearCancellationFlag } from '@/lib/pipelines/cancel';
import type { PipelineType } from '@/lib/pipelines';

export interface AnalysisJobData {
  businessId: string;
  pipelineId: string;
  pipelineType: PipelineType;
}

const globalForWorker = globalThis as unknown as {
  analysisWorker: Worker<AnalysisJobData> | undefined;
};

const log = logger.child('analysis-worker');

function createWorker(): Worker<AnalysisJobData> {
  const worker = new Worker<AnalysisJobData>(
    'ai-analysis',
    async (job: Job<AnalysisJobData>) => {
      const { businessId, pipelineId, pipelineType } = job.data;

      // Pre-check: skip if already cancelled before we even start
      if (await isPipelineCancelled(pipelineId)) {
        log.info('skipping cancelled pipeline', { pipelineId });
        await clearCancellationFlag(pipelineId);
        return { pipelineId, recommendationId: null, revisions: 0, durationMs: 0, pipelineType };
      }

      job.log(`Pipeline ${pipelineId} (${pipelineType}) for ${businessId} starting`);

      const result = await runPipeline({ businessId, pipelineId, pipelineType });

      job.log(`Pipeline ${pipelineId} complete, rec ${result.recommendationId}`);
      return result;
    },
    {
      connection: redisConnection,
      concurrency: parseInt(process.env.ANALYSIS_CONCURRENCY ?? '2', 10),
      limiter: { max: 8, duration: 60_000 },
    }
  );

  worker.on('completed', (job, result) => {
    log.info('job completed', {
      jobId: job.id,
      pipelineId: job.data.pipelineId,
      durationMs: result?.durationMs,
      revisions: result?.revisions,
    });
  });

  worker.on('failed', (job, err) => {
    const error = err as unknown;

    // Cancellation: pipeline threw a plain string. Remove the job so BullMQ
    // doesn't retry it (non-Error throws still get retried by BullMQ).
    if (typeof error === 'string' && error.includes('cancelled')) {
      log.info('pipeline cancelled', { pipelineId: job?.data?.pipelineId });
      job?.remove().catch(() => {});
      return;
    }

    // Rate limit / unrecoverable: already wrapped in UnrecoverableError
    // by withAgentRun — BullMQ won't retry these.
    if (error instanceof UnrecoverableError) {
      log.error('job failed (unrecoverable)', error, {
        jobId: job?.id,
        pipelineId: job?.data?.pipelineId,
      });
      return;
    }

    log.error('job failed', error instanceof Error ? error : new Error(String(error)), {
      jobId: job?.id,
      pipelineId: job?.data?.pipelineId,
    });
  });

  return worker;
}

export const analysisWorker =
  globalForWorker.analysisWorker ?? createWorker();

if (process.env.NODE_ENV !== 'production') {
  globalForWorker.analysisWorker = analysisWorker;
}
