import cron from 'node-cron';
import { randomUUID } from 'crypto';
import {
  dataCollectQueue,
  aiAnalysisQueue,
  competitorCollectQueue,
} from './queues/data-queue';
import { prisma } from './db';
import { logger } from './logger';

type JobHandler = () => Promise<void>;

interface ScheduledJob {
  name: string;
  cron: string;
  run: JobHandler;
}

const log = logger.child('scheduler');

function extractCompetitorUrls(config: unknown): string[] {
  if (!config || typeof config !== 'object') return [];
  const raw = (config as Record<string, unknown>).competitorUrls;
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === 'string' && u.length > 0);
}

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
    name: 'competitor-scrape',
    cron: process.env.COMPETITOR_SCRAPE_CRON ?? '0 8 * * *',
    run: async () => {
      const businesses = await prisma.business.findMany();
      let totalUrls = 0;
      for (const biz of businesses) {
        const urls = extractCompetitorUrls(biz.config);
        if (urls.length === 0) continue;
        const pipelineId = randomUUID();
        for (const url of urls) {
          await competitorCollectQueue.add(
            'competitor-scrape',
            { businessId: biz.id, url, pipelineId },
            { priority: 1 }
          );
          totalUrls++;
        }
      }
      log.info('competitor-scrape tick', {
        businesses: businesses.length,
        urlsEnqueued: totalUrls,
      });
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
