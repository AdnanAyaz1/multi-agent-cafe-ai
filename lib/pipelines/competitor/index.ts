import 'server-only';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { runCompetitorParser } from '@/lib/agents/competitor-parser';
import { runCompetitorAnalyst } from '@/lib/agents/competitor-analyst';
import { runMenuAnalyst } from '@/lib/agents/menu-analyst';
import { runStrategist } from '@/lib/agents/strategist';
import { runCritic, criticHasBlockers } from '@/lib/agents/critic';
import { runSynthesizer, deriveFinalConfidence } from '@/lib/agents/synthesizer';
import { MAX_REVISIONS } from '@/lib/agents/models';
import { clearCancellationFlag } from '@/lib/pipelines/cancel';
import { classifyLLMError, isTerminalReason } from '@/lib/pipelines/errors';
import { runAbortableParallel } from '@/lib/pipelines/abort';
import { persistRecommendation } from '@/lib/pipelines/shared/helpers';
import {
  FLAT_DEMAND,
  competitorWeatherData,
  extractCompetitorUrls,
  loadInputs,
} from './helpers';
import type {
  CompetitorParserOutput,
  CompetitorAnalystOutput,
  StrategistOutput,
  CriticOutput,
  MenuAnalystOutput,
  SynthesizerOutput,
  WeatherAnalystOutput,
} from '@/lib/agents/types';
import type { PipelineResult } from '@/lib/pipelines/shared/types';
import type { PipelineRunContext } from '@/lib/pipelines/abort';

const log = logger.child('pipelines.competitor');

/**
 * Competitor Pipeline
 *
 * Flow:
 *   1. Load business menu + scrape competitor URLs
 *   2. Parse each competitor via competitor-parser agent (abort-aware parallel)
 *   3. Run competitor-analyst agent (analyze all competitors vs our menu)
 *   4. Run menu-analyst agent on our menu
 *   5. Run strategist (with competitor analysis as primary signal)
 *   6. Critic loop -> strategist revisions
 *   7. Synthesizer generates owner briefing
 *   8. Persist Recommendation + RecommendationAction[]
 *
 * The pipeline respects the AbortSignal in ctx:
 *  - All agent calls receive the signal
 *  - Parallel agents are run via runAbortableParallel (one failure aborts siblings)
 *  - Sequential steps check throwIfCancelled() between each agent
 */
export async function runCompetitorPipeline(
  ctx: PipelineRunContext
): Promise<PipelineResult> {
  const start = Date.now();
  log.info('competitor pipeline start', { pipelineId: ctx.pipelineId, businessId: ctx.businessId });

  try {
    const business = await prisma.business.findUnique({
      where: { id: ctx.businessId },
      select: { id: true, config: true },
    });
    if (!business) throw new NotFoundError('Business');

    const urls = extractCompetitorUrls(business.config);
    if (urls.length === 0) {
      throw new ValidationError('No competitor URLs configured for this business');
    }

    const { menu, competitorSnapshots } = await loadInputs(ctx, urls);
    log.info('competitor data collected', {
      pipelineId: ctx.pipelineId,
      snapshotCount: competitorSnapshots.length,
    });

    await ctx.throwIfCancelled();

    // Parse all competitors in parallel — if one hits rate limit, all abort
    const parsedCompetitors: CompetitorParserOutput[] = await runAbortableParallel(
      ctx,
      competitorSnapshots.map((snap) => (c) =>
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
          c
        ).then((r) => r.output)
      )
    );
    log.info('competitors parsed', {
      pipelineId: ctx.pipelineId,
      parsedCount: parsedCompetitors.length,
    });

    await ctx.throwIfCancelled();

    const competitorAnalysis: CompetitorAnalystOutput = (
      await runCompetitorAnalyst(
        {
          competitors: competitorSnapshots.map((snap, i) => ({
            brand: snap.brand ?? parsedCompetitors[i]?.brand ?? null,
            items: snap.items,
            promos: snap.promos,
            notes: snap.notes,
          })),
          ourMenu: menu.items.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            price: i.price,
          })),
        },
        ctx
      )
    ).output;

    await ctx.throwIfCancelled();

    const menuAnalysis: MenuAnalystOutput = (
      await runMenuAnalyst({ menu }, ctx)
    ).output;

    await ctx.throwIfCancelled();

    const weatherForStrategist = competitorWeatherData(competitorAnalysis);
    const emptyWeather: WeatherAnalystOutput = {
      headline: '',
      tempBucket: 'mild',
      precipitation: 'none',
      comfortIndex: 'pleasant',
      consumerSignals: [],
      expectedDemandShift: FLAT_DEMAND,
    };

    let strategist: StrategistOutput = (
      await runStrategist(
        {
          menuAnalysis,
          weatherAnalysis: weatherForStrategist,
          rawMenu: menu,
          competitorData: competitorSnapshots,
          competitorAnalysis,
          revision: 0,
        },
        ctx
      )
    ).output;

    await ctx.throwIfCancelled();

    let critic: CriticOutput = (
      await runCritic(
        { menuAnalysis, weatherAnalysis: emptyWeather, strategistOutput: strategist },
        ctx
      )
    ).output;

    let revisions = 0;
    while (criticHasBlockers(critic) && revisions < MAX_REVISIONS) {
      revisions += 1;
      log.info('revision triggered', {
        pipelineId: ctx.pipelineId,
        round: revisions,
        blockers: critic.issues.filter((i) => i.severity === 'blocker').length,
      });

      await ctx.throwIfCancelled();

      strategist = (
        await runStrategist(
          {
            menuAnalysis,
            weatherAnalysis: weatherForStrategist,
            rawMenu: menu,
            competitorData: competitorSnapshots,
            competitorAnalysis,
            criticFeedback: critic,
            revision: revisions,
          },
          ctx
        )
      ).output;

      await ctx.throwIfCancelled();

      critic = (
        await runCritic(
          { menuAnalysis, weatherAnalysis: emptyWeather, strategistOutput: strategist },
          ctx
        )
      ).output;
    }

    await ctx.throwIfCancelled();

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
            expectedDemandShift: FLAT_DEMAND,
          },
          strategistOutput: strategist,
          criticOutput: critic,
        },
        ctx
      )
    ).output;

    const finalConfidence = deriveFinalConfidence(strategist.confidence, critic);

    const recommendation = await persistRecommendation(
      ctx,
      { strategist, critic, synthesizer, finalConfidence },
      'competitor',
      { menuAnalysis, competitorAnalysis }
    );

    const durationMs = Date.now() - start;
    log.info('competitor pipeline complete', {
      pipelineId: ctx.pipelineId,
      recommendationId: recommendation.id,
      durationMs,
    });

    await clearCancellationFlag(ctx.pipelineId);

    return {
      pipelineId: ctx.pipelineId,
      recommendationId: recommendation.id,
      revisions,
      durationMs,
      pipelineType: 'competitor',
    };
  } catch (error) {
    // If this is a terminal error, ensure the whole pipeline is aborted
    const reason = classifyLLMError(error);
    if (isTerminalReason(reason) && !ctx.signal.aborted) {
      await ctx.abort(reason);
    }
    throw error;
  }
}
