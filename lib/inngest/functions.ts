import { randomUUID } from 'crypto';
import { inngest } from './client';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { runPipeline } from '@/lib/pipelines';
import { PipelineCancelledError } from '@/lib/pipelines/errors';
import { isPipelineCancelled, clearCancellationFlag } from '@/lib/pipelines/cancel';
import { fetchWeather } from '@/lib/services/weather/client';
import { scrapeCompetitorUrl } from '@/lib/services/competitor/client';
import { runCompetitorParser } from '@/lib/agents/competitor-parser';
import type { CompetitorData } from '@/lib/types';

const log = logger.child('inngest');

// ─── Analysis Pipeline ─────────────────────────────────────────────

export const runAnalysisPipeline = inngest.createFunction(
  {
    id: 'analysis-pipeline',
    name: 'Analysis Pipeline',
    concurrency: 2,
    triggers: [{ event: 'pipeline/run' }],
  },
  async ({ event, step }) => {
    const { businessId, pipelineId, pipelineType } = event.data;

    const cancelled = await step.run('check-cancelled', () =>
      isPipelineCancelled(pipelineId)
    );
    if (cancelled) {
      await step.run('clear-cancel', () => clearCancellationFlag(pipelineId));
      return { pipelineId, recommendationId: null, revisions: 0, durationMs: 0, pipelineType };
    }

    log.info('pipeline starting', { pipelineId, pipelineType, businessId });

    const result = await step.run('run-pipeline', () =>
      runPipeline({ businessId, pipelineId, pipelineType })
    );

    log.info('pipeline complete', { pipelineId, recommendationId: result.recommendationId });
    return result;
  }
);

// ─── Competitor Scrape ─────────────────────────────────────────────

export const runCompetitorScrape = inngest.createFunction(
  {
    id: 'competitor-scrape',
    name: 'Competitor Scrape',
    concurrency: 2,
    triggers: [{ event: 'competitor/scrape' }],
  },
  async ({ event, step }) => {
    const { businessId, url, pipelineId: rawPipelineId, timeoutMs, maxTextLength } = event.data;
    const pipelineId = rawPipelineId ?? randomUUID();

    const cancelled = await step.run('check-cancelled', () =>
      isPipelineCancelled(pipelineId)
    );
    if (cancelled) {
      throw new PipelineCancelledError('user_cancelled');
    }

    log.info('scrape starting', { pipelineId, url, businessId });

    const scrape = await step.run('scrape', () =>
      scrapeCompetitorUrl(url, { timeoutMs, maxTextLength })
    );

    const cancelledAfter = await step.run('check-cancelled-after-scrape', () =>
      isPipelineCancelled(pipelineId)
    );
    if (cancelledAfter) {
      throw new PipelineCancelledError('user_cancelled');
    }

    const parseStart = Date.now();
    const parsed = await step.run('parse', () =>
      runCompetitorParser({ scrape }, { pipelineId, businessId })
    );
    const parseMs = Date.now() - parseStart;

    const snapshot = await step.run('persist', () => {
      const data: CompetitorData = {
        url: scrape.url,
        finalUrl: scrape.finalUrl,
        brand: parsed.output.brand ?? undefined,
        items: parsed.output.items.map((item: (typeof parsed.output.items)[number]) => ({
          ...item,
          isPromo: item.isPromo ?? false,
          category: item.category ?? undefined,
          price: item.price ?? undefined,
          currency: item.currency ?? undefined,
          description: item.description ?? undefined,
        })),
        promos: parsed.output.promos.map((promo: (typeof parsed.output.promos)[number]) => ({
          ...promo,
          discountPercent: promo.discountPercent ?? undefined,
          validUntil: promo.validUntil ?? undefined,
        })),
        notes: parsed.output.notes,
        scrapedAt: scrape.scrapedAt,
      };

      return prisma.dataSnapshot.create({
        data: {
          businessId,
          source: 'competitors',
          data: JSON.parse(JSON.stringify(data)) as object,
          collectedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    });

    log.info('scrape complete', {
      pipelineId,
      url,
      items: parsed.output.items.length,
      promos: parsed.output.promos.length,
      scrapeMs: scrape.durationMs,
      parseMs,
    });

    return {
      success: true,
      url,
      itemCount: parsed.output.items.length,
      promoCount: parsed.output.promos.length,
      snapshotId: snapshot.id,
      scrapeMs: scrape.durationMs,
      parseMs,
    };
  }
);

// ─── Weather Fetch ─────────────────────────────────────────────────

export const runWeatherFetch = inngest.createFunction(
  {
    id: 'weather-fetch',
    name: 'Weather Fetch',
    concurrency: 10,
    triggers: [{ event: 'weather/fetch' }],
  },
  async ({ event, step }) => {
    const { businessId, city, pipelineId } = event.data;

    if (pipelineId) {
      const cancelled = await step.run('check-cancelled', () =>
        isPipelineCancelled(pipelineId)
      );
      if (cancelled) {
        throw new PipelineCancelledError('user_cancelled');
      }
    }

    log.info('weather fetch starting', { businessId, city });

    const weather = await step.run('fetch', () => fetchWeather(city));

    if (pipelineId) {
      const cancelledAfter = await step.run('check-cancelled-after', () =>
        isPipelineCancelled(pipelineId)
      );
      if (cancelledAfter) {
        throw new PipelineCancelledError('user_cancelled');
      }
    }

    await step.run('persist', () =>
      prisma.dataSnapshot.create({
        data: {
          businessId,
          source: 'weather',
          data: JSON.parse(JSON.stringify(weather)) as object,
          collectedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      })
    );

    log.info('weather fetch complete', { businessId, city, temperature: weather.temperature });
    return { success: true, city, temperature: weather.temperature };
  }
);

// ─── Cron: Daily Weather Fetch ─────────────────────────────────────

function extractCompetitorUrls(config: unknown): string[] {
  if (!config || typeof config !== 'object') return [];
  const raw = (config as Record<string, unknown>).competitorUrls;
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === 'string' && u.length > 0);
}

export const weatherFetchCron = inngest.createFunction(
  {
    id: 'weather-fetch-cron',
    name: 'Daily Weather Fetch',
    triggers: [{ cron: process.env.WEATHER_FETCH_CRON ?? '0 6 * * *' }],
  },
  async ({ step }) => {
    const businesses = await step.run('load-businesses', () =>
      prisma.business.findMany({ select: { id: true, city: true } })
    );

    log.info('weather-fetch cron', { businesses: businesses.length });

    await step.sendEvent(
      'dispatch-weather',
      businesses
        .filter((b: { city: string | null }) => b.city)
        .map((b: { id: string; city: string }) => ({
          name: 'weather/fetch' as const,
          data: { businessId: b.id, city: b.city },
        }))
    );

    return { dispatched: businesses.length };
  }
);

// ─── Cron: Daily Competitor Scrape ─────────────────────────────────

export const competitorScrapeCron = inngest.createFunction(
  {
    id: 'competitor-scrape-cron',
    name: 'Daily Competitor Scrape',
    triggers: [{ cron: process.env.COMPETITOR_SCRAPE_CRON ?? '0 8 * * *' }],
  },
  async ({ step }) => {
    const businesses = await step.run('load-businesses', () =>
      prisma.business.findMany({ select: { id: true, config: true } })
    );

    const events: Array<{ name: 'competitor/scrape'; data: { businessId: string; url: string; pipelineId: string } }> = [];
    const pipelineId = randomUUID();

    for (const biz of businesses) {
      const urls = extractCompetitorUrls(biz.config);
      for (const url of urls) {
        events.push({
          name: 'competitor/scrape',
          data: { businessId: biz.id, url, pipelineId },
        });
      }
    }

    log.info('competitor-scrape cron', { businesses: businesses.length, urls: events.length });

    if (events.length > 0) {
      await step.sendEvent('dispatch-scrapes', events);
    }

    return { dispatched: events.length };
  }
);

// ─── Cron: Daily Analysis ──────────────────────────────────────────

export const dailyAnalysisCron = inngest.createFunction(
  {
    id: 'daily-analysis-cron',
    name: 'Daily Analysis',
    triggers: [{ cron: process.env.DAILY_ANALYSIS_CRON ?? '0 9 * * *' }],
  },
  async ({ step }) => {
    const businesses = await step.run('load-businesses', () =>
      prisma.business.findMany({ select: { id: true } })
    );

    log.info('daily-analysis cron', { businesses: businesses.length });

    await step.sendEvent(
      'dispatch-analysis',
      businesses.map((b: { id: string }) => ({
        name: 'pipeline/run' as const,
        data: {
          businessId: b.id,
          pipelineId: randomUUID(),
          pipelineType: 'weather' as const,
        },
      }))
    );

    return { dispatched: businesses.length };
  }
);
