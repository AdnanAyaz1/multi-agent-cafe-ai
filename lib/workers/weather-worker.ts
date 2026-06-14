import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/db';
import { fetchWeather } from '@/lib/services/weather/client';
import { redisConnection } from '@/lib/queues/connection';
import { logger } from '@/lib/logger';

const log = logger.child('weather-worker');

interface WeatherJobData {
  businessId: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

const globalForWorker = globalThis as unknown as {
  weatherWorker: Worker<WeatherJobData> | undefined;
};

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
    log.error(`job ${job?.id} failed`, err);
  });

  return worker;
}

export const weatherWorker =
  globalForWorker.weatherWorker ?? createWorker();

if (process.env.NODE_ENV !== 'production') {
  globalForWorker.weatherWorker = weatherWorker;
}
