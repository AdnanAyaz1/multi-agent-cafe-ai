import 'server-only';
import { Worker, type Job } from 'bullmq';
import { runAnalysisPipeline } from '@/lib/agents/orchestrator';
import { logger } from '@/lib/logger';

export interface AnalysisJobData {
  businessId: string;
  pipelineId: string;
}

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
};

const globalForWorker = globalThis as unknown as {
  analysisWorker: Worker<AnalysisJobData> | undefined;
};

const log = logger.child('analysis-worker');

function createWorker(): Worker<AnalysisJobData> {
  const worker = new Worker<AnalysisJobData>(
    'ai-analysis',
    async (job: Job<AnalysisJobData>) => {
      const { businessId, pipelineId } = job.data;
      job.log(`Pipeline ${pipelineId} for ${businessId} starting`);

      const result = await runAnalysisPipeline({ businessId, pipelineId });

      job.log(`Pipeline ${pipelineId} complete, rec ${result.recommendationId}`);
      return result;
    },
    {
      connection,
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
    log.error('job failed', err, {
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
