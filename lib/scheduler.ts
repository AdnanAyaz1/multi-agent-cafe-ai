import cron from 'node-cron';
import { dataCollectQueue, aiAnalysisQueue } from './queues/data-queue';
import { prisma } from './db';

type JobHandler = () => Promise<void>;

interface ScheduledJob {
  name: string;
  cron: string;
  run: JobHandler;
}

const jobs: ScheduledJob[] = [
  {
    name: 'weather-fetch',
    cron: process.env.WEATHER_FETCH_CRON ?? '0 6 * * *',
    run: async () => {
      const businesses = await prisma.business.findMany();
      console.log(`[scheduler] weather-fetch: ${businesses.length} business(es)`);
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
      console.log('[scheduler] sales-pull: not implemented yet');
    },
  },
  {
    name: 'competitor-scrape',
    cron: process.env.COMPETITOR_SCRAPE_CRON ?? '0 8 * * *',
    run: async () => {
      console.log('[scheduler] competitor-scrape: not implemented yet');
    },
  },
  {
    name: 'daily-analysis',
    cron: process.env.DAILY_ANALYSIS_CRON ?? '0 9 * * *',
    run: async () => {
      const businesses = await prisma.business.findMany();
      for (const biz of businesses) {
        await aiAnalysisQueue.add(
          'daily-analysis',
          { businessId: biz.id },
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
        console.error(`[scheduler] ${job.name} crashed:`, e);
      }
    });
    console.log(`[scheduler] registered ${job.name} (${job.cron})`);
  }
}
