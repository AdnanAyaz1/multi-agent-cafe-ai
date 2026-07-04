import { Worker, Job, UnrecoverableError } from 'bullmq';
import { prisma } from '@/lib/db';
import { fetchWeather } from '@/lib/services/weather/client';
import { redisConnection } from '@/lib/queues/connection';
import { logger } from '@/lib/logger';
import { PipelineCancelledError } from '@/lib/pipelines/errors';
import { isPipelineCancelled } from '@/lib/pipelines/cancel';
import type { WeatherJobData } from './types';

const log = logger.child('weather-worker');

const globalForWorker = globalThis as unknown as {
  weatherWorker: Worker<WeatherJobData> | undefined;
};

function createWorker(): Worker<WeatherJobData> {
  const worker = new Worker<WeatherJobData>(
    'data-collect',
    async (job: Job<WeatherJobData>) => {
      const { businessId, city } = job.data;
      const pipelineId = job.data.pipelineId;
      job.log(`Fetching weather for ${city}...`);

      // Check if pipeline was cancelled before starting
      if (pipelineId && (await isPipelineCancelled(pipelineId))) {
        log.info('skipping cancelled pipeline weather fetch', { pipelineId, city });
        throw new PipelineCancelledError('user_cancelled');
      }

      const weather = await fetchWeather(city);

      // Check cancellation after fetch
      if (pipelineId && (await isPipelineCancelled(pipelineId))) {
        log.info('pipeline cancelled after weather fetch', { pipelineId, city });
        throw new PipelineCancelledError('user_cancelled');
      }

      await prisma.dataSnapshot.create({
        data: {
          businessId,
          source: 'weather',
          data: JSON.parse(JSON.stringify(weather)) as object,
          collectedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return {
        success: true,
        city,
        temperature: weather.temperature,
      };
    },
    {
      connection: redisConnection,
      limiter: { max: 10, duration: 60_000 },
    }
  );

  worker.on('completed', (job) => {
    log.info(`job ${job.id} completed`, { city: job.data.city });
  });

  worker.on('failed', (job, err) => {
    const error = err as unknown;

    if (error instanceof PipelineCancelledError) {
      log.info('weather fetch cancelled', { pipelineId: job?.data?.pipelineId });
      job?.remove().catch(() => {});
      return;
    }

    if (error instanceof UnrecoverableError) {
      log.error('weather fetch failed (unrecoverable)', error, { jobId: job?.id });
      return;
    }

    log.error(`job ${job?.id} failed`, error instanceof Error ? error : new Error(String(error)));
  });

  return worker;
}

export const weatherWorker =
  globalForWorker.weatherWorker ?? createWorker();

if (process.env.NODE_ENV !== 'production') {
  globalForWorker.weatherWorker = weatherWorker;
}
