import cron from 'node-cron';
import { randomUUID } from 'crypto';
import { dataCollectQueue, aiAnalysisQueue } from './queues/data-queue';
import { prisma } from './db';
import { logger } from './logger';

type JobHandler = () => Promise<void>;

interface ScheduledJob {
  name: string;
  cron: string;
  run: JobHandler;
}

const log = logger.child('scheduler');

const jobs: ScheduledJob[] = [
  {
    name: 'weather-fetch',
    cron: process.env.WEATHER_FETCH_CRON ?? '0 6 * * *',
    run: async () => {
      const businesses = await prisma.business.findMany();
      log.info('weather-fetch tick', { businesses: businesses.length });
      for (const biz of businesses) {
        await dataCollectQueue.add(
          'weather-fetch',
          {
            businessId: biz.id,
            city: biz.city,
            latitude: biz.latitude ?? undefined,
            longitude: biz.longitude ?? undefined,
          },
          { priority: 1 }
        );
      }
    },
  },
  {
    name: 'sales-pull',
    cron: process.env.SALES_PULL_CRON ?? '0 7 * * *',
    run: async () => {
      log.info('sales-pull tick (not implemented)');
    },
  },
  {
    name: 'daily-analysis',
    cron: process.env.DAILY_ANALYSIS_CRON ?? '0 9 * * *',
    run: async () => {
      const businesses = await prisma.business.findMany();
      log.info('daily-analysis tick', { businesses: businesses.length });
      for (const biz of businesses) {
        await aiAnalysisQueue.add(
          'full-pipeline',
          { businessId: biz.id, pipelineId: randomUUID() },
          { priority: 2 }
        );
      }
    },
  },
];

const globalForScheduler = globalThis as unknown as {
  schedulerStarted: boolean | undefined;
};

export function startScheduler(): void {
  if (globalForScheduler.schedulerStarted) return;
  globalForScheduler.schedulerStarted = true;

  for (const job of jobs) {
    cron.schedule(job.cron, async () => {
      try {
        await job.run();
      } catch (e) {
        log.error(`${job.name} crashed`, e);
      }
    });
    log.info(`registered ${job.name} (${job.cron})`);
  }
}
