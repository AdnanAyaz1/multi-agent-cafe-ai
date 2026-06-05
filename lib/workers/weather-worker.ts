import 'server-only';
import { Worker, Job } from 'bullmq';
import { prisma, toPrismaJson } from '@/lib/db';
import { fetchWeather } from '@/lib/services/weather/client';
import { logger } from '@/lib/logger';

interface WeatherJobData {
  businessId: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
};

const globalForWorker = globalThis as unknown as {
  weatherWorker: Worker<WeatherJobData> | undefined;
};

const log = logger.child('weather-worker');

function createWorker(): Worker<WeatherJobData> {
  const worker = new Worker<WeatherJobData>(
    'data-collect',
    async (job: Job<WeatherJobData>) => {
      const { businessId, city } = job.data;
      job.log(`Fetching weather for ${city}...`);

      const weather = await fetchWeather(city);

      await prisma.dataSnapshot.create({
        data: {
          businessId,
          source: 'weather',
          data: toPrismaJson(weather),
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
      connection,
      limiter: { max: 10, duration: 60_000 },
    }
  );

  worker.on('completed', (job) => {
    log.info('job completed', { jobId: job.id, city: job.data.city });
  });

  worker.on('failed', (job, err) => {
    log.error('job failed', err, {
      jobId: job?.id,
      city: job?.data?.city,
    });
  });

  return worker;
}

export const weatherWorker =
  globalForWorker.weatherWorker ?? createWorker();

if (process.env.NODE_ENV !== 'production') {
  globalForWorker.weatherWorker = weatherWorker;
}
