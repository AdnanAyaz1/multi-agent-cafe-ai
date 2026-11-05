import 'server-only';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getMenuForBusiness } from '@/lib/menu';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { inngest } from '@/lib/inngest/client';
import type { CompetitorData } from '@/lib/types';
import type { CompetitorAnalystOutput, WeatherAnalystOutput } from '@/lib/agents/types';
import type { PipelineContext, CompetitorPipelineInputs } from '@/lib/pipelines/shared/types';

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

export async function loadInputs(
  context: PipelineContext,
  urls: string[]
): Promise<CompetitorPipelineInputs> {
  const business = await prisma.business.findUnique({
    where: { id: context.businessId },
  });
  if (!business) throw new NotFoundError('Business');

  const menu = await getMenuForBusiness(context.businessId);

  try {
    await inngest.send(
      urls.map((url) => ({
        name: 'competitor/scrape' as const,
        data: { businessId: context.businessId, url, pipelineId: context.pipelineId },
      }))
    );
    log.info('scrape events dispatched', { pipelineId: context.pipelineId, urlCount: urls.length });
  } catch (err) {
    log.warn('Could not dispatch Inngest scrape events (Inngest offline or unconfigured), falling back to database snapshots', {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const timeoutMs = process.env.NODE_ENV === 'test' ? 5000 : 30 * 1000;
  const pollInterval = 2000;
  const startTime = Date.now();
  let competitorSnapshots: CompetitorData[] = [];
  const targetUrlsLower = urls.map((u) => u.toLowerCase().trim());

  while (Date.now() - startTime < timeoutMs) {
    const dbSnapshots = await prisma.dataSnapshot.findMany({
      where: {
        businessId: context.businessId,
        source: 'competitors',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { collectedAt: 'desc' },
      take: 50,
    });

    // Deduplicate by URL (keep freshest) matching requested URLs
    const map = new Map<string, CompetitorData>();
    for (const snap of dbSnapshots) {
      const data = snap.data as unknown as CompetitorData;
      if (data?.url) {
        const matchesTarget = targetUrlsLower.includes(data.url.toLowerCase().trim());
        if (matchesTarget && !map.has(data.url.toLowerCase())) {
          map.set(data.url.toLowerCase(), data);
        }
      }
    }
    competitorSnapshots = Array.from(map.values());

    const scrapedUrls = new Set(competitorSnapshots.map((s) => s.url.toLowerCase().trim()));
    const allCovered = targetUrlsLower.every((u) => scrapedUrls.has(u));
    if (allCovered || (competitorSnapshots.length > 0 && competitorSnapshots.length >= urls.length)) {
      break;
    }

    // If we already have competitor data and Inngest wasn't available, don't stall
    if (competitorSnapshots.length > 0 && Date.now() - startTime > 4000) {
      log.info('proceeding with available competitor snapshots', {
        available: competitorSnapshots.length,
        totalUrls: urls.length,
      });
      break;
    }

    await new Promise((r) => setTimeout(r, pollInterval));
  }

  // Fallback: if no specific snapshot matched the URL, check if any snapshot exists
  if (competitorSnapshots.length === 0) {
    const fallbackSnap = await prisma.dataSnapshot.findFirst({
      where: {
        businessId: context.businessId,
        source: 'competitors',
      },
      orderBy: { collectedAt: 'desc' },
    });
    if (fallbackSnap) {
      competitorSnapshots = [fallbackSnap.data as unknown as CompetitorData];
    } else {
      throw new ValidationError('No competitor data collected within timeout');
    }
  }

  return { menu, competitorSnapshots };
}
