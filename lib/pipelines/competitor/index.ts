import 'server-only';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getMenuForBusiness } from '@/lib/menu';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { competitorCollectQueue } from '@/lib/queues/data-queue';
import { runCompetitorParser } from '@/lib/agents/competitor-parser';
import { runCompetitorAnalyst } from '@/lib/agents/competitor-analyst';
import { runMenuAnalyst } from '@/lib/agents/menu-analyst';
import { runStrategist } from '@/lib/agents/strategist';
import { runCritic, criticHasBlockers } from '@/lib/agents/critic';
import { runSynthesizer, deriveFinalConfidence } from '@/lib/agents/synthesizer';
import { MAX_REVISIONS } from '@/lib/agents/models';
import type { CompetitorData } from '@/lib/types';
import type {
  CompetitorParserOutput,
  CompetitorAnalystOutput,
  StrategistOutput,
  CriticOutput,
  MenuAnalystOutput,
  SynthesizerOutput,
} from '@/lib/agents/types';
import type { PipelineContext } from '@/lib/pipelines/shared/types';
import type { PipelineResult } from '@/lib/pipelines/shared/types';

const log = logger.child('pipelines.competitor');

function extractCompetitorUrls(config: unknown): string[] {
  if (!config || typeof config !== 'object') return [];
  const raw = (config as Record<string, unknown>).competitorUrls;
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === 'string' && u.length > 0);
}

interface CompetitorPipelineInputs {
  menu: Awaited<ReturnType<typeof getMenuForBusiness>>;
  competitorSnapshots: CompetitorData[];
}

async function loadInputs(
  context: PipelineContext,
  urls: string[]
): Promise<CompetitorPipelineInputs> {
  const business = await prisma.business.findUnique({
    where: { id: context.businessId },
  });
  if (!business) throw new NotFoundError('Business');

  const menu = await getMenuForBusiness(context.businessId);

  // Enqueue scrape jobs
  for (const url of urls) {
    await competitorCollectQueue.add(
      'competitor-scrape',
      {
        businessId: context.businessId,
        url,
        pipelineId: context.pipelineId,
      },
      { priority: 1 }
    );
  }
  log.info('scrape jobs enqueued', { pipelineId: context.pipelineId, urlCount: urls.length });

  // Poll for snapshots
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

interface PersistArgs {
  menuAnalysis: MenuAnalystOutput;
  competitorAnalysis: CompetitorAnalystOutput;
  strategist: StrategistOutput;
  critic: CriticOutput;
  synthesizer: SynthesizerOutput;
  finalConfidence: string;
}

async function persistRecommendation(
  context: PipelineContext,
  args: PersistArgs
): Promise<{ id: string }> {
  return prisma.recommendation.create({
    data: {
      businessId: context.businessId,
      summary: args.synthesizer.headline,
      reasoning: args.synthesizer.briefingMarkdown,
      confidence: args.finalConfidence,
      category: 'competitor',
      priority: priorityFromActions(args.strategist),
      status: 'pending',
      dataAnalysis: JSON.parse(
        JSON.stringify({
          pipelineId: context.pipelineId,
          pipelineType: 'competitor',
          menuAnalysis: args.menuAnalysis,
          competitorAnalysis: args.competitorAnalysis,
        })
      ) as object,
      criticNotes: JSON.parse(JSON.stringify(args.critic)) as object,
      actions: {
        create: args.strategist.actions.map((a) => ({
          actionType: a.action,
          item: a.itemName,
          details: JSON.parse(
            JSON.stringify({
              itemId: a.itemId,
              priority: a.priority,
              reason: a.reason,
              discountPercent: a.discountPercent,
            })
          ) as object,
        })),
      },
    },
    select: { id: true },
  });
}

function priorityFromActions(strategist: StrategistOutput): number {
  const min = strategist.actions.reduce(
    (acc, a) => Math.min(acc, a.priority),
    5
  );
  return 6 - min;
}

/**
 * Competitor Pipeline
 *
 * Flow:
 *   1. Load business menu + scrape competitor URLs
 *   2. Parse each competitor via competitor-parser agent (parallel)
 *   3. Run competitor-analyst agent (analyze all competitors vs our menu)
 *   4. Run menu-analyst agent on our menu
 *   5. Run strategist (with competitor analysis as primary signal)
 *   6. Critic loop -> strategist revisions
 *   7. Synthesizer generates owner briefing
 *   8. Persist Recommendation + RecommendationAction[]
 */
export async function runCompetitorPipeline(
  context: PipelineContext
): Promise<PipelineResult> {
  const start = Date.now();
  log.info('competitor pipeline start', { ...context });

  const business = await prisma.business.findUnique({
    where: { id: context.businessId },
    select: { id: true, config: true },
  });
  if (!business) throw new NotFoundError('Business');

  const urls = extractCompetitorUrls(business.config);
  if (urls.length === 0) {
    throw new ValidationError('No competitor URLs configured for this business');
  }

  // Step 1: Load menu + scrape competitors
  const { menu, competitorSnapshots } = await loadInputs(context, urls);
  log.info('competitor data collected', {
    pipelineId: context.pipelineId,
    snapshotCount: competitorSnapshots.length,
  });

  // Step 2: Parse each competitor via competitor-parser agent (parallel)
  const parsedCompetitors: CompetitorParserOutput[] = await Promise.all(
    competitorSnapshots.map((snap) =>
      runCompetitorParser(
        {
          scrape: {
            url: snap.url,
            finalUrl: snap.finalUrl,
            title: snap.brand ?? '',
            text: snap.notes.join('. '),
            scrapedAt: snap.scrapedAt,
          },
        },
        context
      ).then((r) => r.output)
    )
  );
  log.info('competitors parsed', {
    pipelineId: context.pipelineId,
    parsedCount: parsedCompetitors.length,
  });

  // Step 3: Run competitor-analyst agent
  const ourMenuItems = menu.items.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    price: i.price,
  }));

  const competitorAnalysis: CompetitorAnalystOutput = (
    await runCompetitorAnalyst(
      {
        competitors: competitorSnapshots.map((snap, i) => ({
          brand: snap.brand ?? parsedCompetitors[i]?.brand ?? null,
          items: snap.items,
          promos: snap.promos,
          notes: snap.notes,
        })),
        ourMenu: ourMenuItems,
      },
      context
    )
  ).output;

  // Step 4: Run menu-analyst agent
  const menuAnalysis: MenuAnalystOutput = (
    await runMenuAnalyst({ menu }, context)
  ).output;

  // Step 5: Run strategist with competitor analysis
  let strategist: StrategistOutput = (
    await runStrategist(
      {
        menuAnalysis,
        weatherAnalysis: {
          headline: competitorAnalysis.recommendations[0] ?? 'Competitor analysis complete',
          tempBucket: 'mild',
          precipitation: 'none',
          comfortIndex: 'pleasant',
          consumerSignals: competitorAnalysis.opportunities.slice(0, 4),
          expectedDemandShift: {
            hotItems: 'flat',
            coldItems: 'flat',
            food: 'flat',
            dessert: 'flat',
          },
        },
        rawMenu: menu,
        competitorData: competitorSnapshots,
        competitorAnalysis,
        revision: 0,
      },
      context
    )
  ).output;

  // Step 6: Critic loop
  let critic: CriticOutput = (
    await runCritic(
      { menuAnalysis, weatherAnalysis: { headline: '', tempBucket: 'mild', precipitation: 'none', comfortIndex: 'pleasant', consumerSignals: [], expectedDemandShift: { hotItems: 'flat', coldItems: 'flat', food: 'flat', dessert: 'flat' } }, strategistOutput: strategist },
      context
    )
  ).output;

  let revisions = 0;
  while (criticHasBlockers(critic) && revisions < MAX_REVISIONS) {
    revisions += 1;
    log.info('revision triggered', {
      pipelineId: context.pipelineId,
      round: revisions,
      blockers: critic.issues.filter((i) => i.severity === 'blocker').length,
    });

    strategist = (
      await runStrategist(
        {
          menuAnalysis,
          weatherAnalysis: {
            headline: competitorAnalysis.recommendations[0] ?? 'Competitor analysis complete',
            tempBucket: 'mild',
            precipitation: 'none',
            comfortIndex: 'pleasant',
            consumerSignals: competitorAnalysis.opportunities.slice(0, 4),
            expectedDemandShift: {
              hotItems: 'flat',
              coldItems: 'flat',
              food: 'flat',
              dessert: 'flat',
            },
          },
          rawMenu: menu,
          competitorData: competitorSnapshots,
          competitorAnalysis,
          criticFeedback: critic,
          revision: revisions,
        },
        context
      )
    ).output;

    critic = (
      await runCritic(
        { menuAnalysis, weatherAnalysis: { headline: '', tempBucket: 'mild', precipitation: 'none', comfortIndex: 'pleasant', consumerSignals: [], expectedDemandShift: { hotItems: 'flat', coldItems: 'flat', food: 'flat', dessert: 'flat' } }, strategistOutput: strategist },
        context
      )
    ).output;
  }

  // Step 7: Synthesizer
  const synthesizer: SynthesizerOutput = (
    await runSynthesizer(
      {
        menuAnalysis,
        weatherAnalysis: {
          headline: 'Competitor intelligence gathered',
          tempBucket: 'mild',
          precipitation: 'none',
          comfortIndex: 'pleasant',
          consumerSignals: competitorAnalysis.recommendations.slice(0, 4),
          expectedDemandShift: {
            hotItems: 'flat',
            coldItems: 'flat',
            food: 'flat',
            dessert: 'flat',
          },
        },
        strategistOutput: strategist,
        criticOutput: critic,
      },
      context
    )
  ).output;

  const finalConfidence = deriveFinalConfidence(strategist.confidence, critic);

  // Step 8: Persist
  const recommendation = await persistRecommendation(context, {
    menuAnalysis,
    competitorAnalysis,
    strategist,
    critic,
    synthesizer,
    finalConfidence,
  });

  const durationMs = Date.now() - start;
  log.info('competitor pipeline complete', {
    pipelineId: context.pipelineId,
    recommendationId: recommendation.id,
    durationMs,
  });

  return {
    pipelineId: context.pipelineId,
    recommendationId: recommendation.id,
    revisions,
    durationMs,
    pipelineType: 'competitor',
  };
}
