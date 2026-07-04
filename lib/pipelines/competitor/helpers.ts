import 'server-only';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getMenuForBusiness } from '@/lib/menu';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { competitorCollectQueue } from '@/lib/queues/data-queue';
import type { CompetitorData } from '@/lib/types';
import type { CompetitorAnalystOutput, WeatherAnalystOutput } from '@/lib/agents/types';
import type { PipelineContext } from '@/lib/pipelines/shared/types';

const log = logger.child('pipelines.competitor');

export const FLAT_DEMAND = {
  hotItems: 'flat' as const,
  coldItems: 'flat' as const,
  food: 'flat' as const,
  dessert: 'flat' as const,
};

export function competitorWeatherData(competitorAnalysis: CompetitorAnalystOutput): WeatherAnalystOutput {
  return {
    headline: competitorAnalysis.recommendations[0] ?? 'Competitor analysis complete',
    tempBucket: 'mild',
    precipitation: 'none',
    comfortIndex: 'pleasant',
    consumerSignals: competitorAnalysis.opportunities.slice(0, 4),
    expectedDemandShift: FLAT_DEMAND,
  };
}

export function extractCompetitorUrls(config: unknown): string[] {
  if (!config || typeof config !== 'object') return [];
  const raw = (config as Record<string, unknown>).competitorUrls;
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === 'string' && u.length > 0);
}

export interface CompetitorPipelineInputs {
  menu: Awaited<ReturnType<typeof getMenuForBusiness>>;
  competitorSnapshots: CompetitorData[];
}

export async function loadInputs(
  context: PipelineContext,
  urls: string[]
): Promise<CompetitorPipelineInputs> {
  const business = await prisma.business.findUnique({
    where: { id: context.businessId },
  });
  if (!business) throw new NotFoundError('Business');

  const menu = await getMenuForBusiness(context.businessId);

  for (const url of urls) {
    await competitorCollectQueue.add(
      'competitor-scrape',
      { businessId: context.businessId, url, pipelineId: context.pipelineId },
      { priority: 1 }
    );
  }
  log.info('scrape jobs enqueued', { pipelineId: context.pipelineId, urlCount: urls.length });

  const timeoutMs = 2 * 60 * 1000;
  const pollInterval = 3000;
  const startTime = Date.now();
  let competitorSnapshots: CompetitorData[] = [];

  while (Date.now() - startTime < timeoutMs) {
    const dbSnapshots = await prisma.dataSnapshot.findMany({
      where: {
        businessId: context.businessId,
        source: 'competitors',
        expiresAt: { gt: new Date() },
      },
      orderBy: { collectedAt: 'desc' },
      take: urls.length,
    });

    competitorSnapshots = dbSnapshots.map((s) => s.data as unknown as CompetitorData);

    const scrapedUrls = new Set(competitorSnapshots.map((s) => s.url));
    const allCovered = urls.every((u) => scrapedUrls.has(u));
    if (allCovered || competitorSnapshots.length >= urls.length) break;

    await new Promise((r) => setTimeout(r, pollInterval));
  }

  if (competitorSnapshots.length === 0) {
    throw new ValidationError('No competitor data collected within timeout');
  }

  return { menu, competitorSnapshots };
}
