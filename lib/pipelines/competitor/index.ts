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
import { isPipelineCancelled, clearCancellationFlag } from '@/lib/pipelines/cancel';
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
import type { PipelineContext, PipelineResult } from '@/lib/pipelines/shared/types';

const log = logger.child('pipelines.competitor');

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

  try {
    const business = await prisma.business.findUnique({
      where: { id: context.businessId },
      select: { id: true, config: true },
    });
    if (!business) throw new NotFoundError('Business');

    const urls = extractCompetitorUrls(business.config);
    if (urls.length === 0) {
      throw new ValidationError('No competitor URLs configured for this business');
    }

    const { menu, competitorSnapshots } = await loadInputs(context, urls);
    log.info('competitor data collected', {
      pipelineId: context.pipelineId,
      snapshotCount: competitorSnapshots.length,
    });

    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

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

    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

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
        context
      )
    ).output;

    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

    const menuAnalysis: MenuAnalystOutput = (
      await runMenuAnalyst({ menu }, context)
    ).output;

    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

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
        context
      )
    ).output;

    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

    let critic: CriticOutput = (
      await runCritic(
        { menuAnalysis, weatherAnalysis: emptyWeather, strategistOutput: strategist },
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

      if (await isPipelineCancelled(context.pipelineId)) {
        throw 'Pipeline cancelled by user';
      }

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
          context
        )
      ).output;

      if (await isPipelineCancelled(context.pipelineId)) {
        throw 'Pipeline cancelled by user';
      }

      critic = (
        await runCritic(
          { menuAnalysis, weatherAnalysis: emptyWeather, strategistOutput: strategist },
          context
        )
      ).output;
    }

    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

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
        context
      )
    ).output;

    const finalConfidence = deriveFinalConfidence(strategist.confidence, critic);

    const recommendation = await persistRecommendation(
      context,
      { strategist, critic, synthesizer, finalConfidence },
      'competitor',
      { menuAnalysis, competitorAnalysis }
    );

    const durationMs = Date.now() - start;
    log.info('competitor pipeline complete', {
      pipelineId: context.pipelineId,
      recommendationId: recommendation.id,
      durationMs,
    });

    await clearCancellationFlag(context.pipelineId);

    return {
      pipelineId: context.pipelineId,
      recommendationId: recommendation.id,
      revisions,
      durationMs,
      pipelineType: 'competitor',
    };
  } catch (error) {
    throw error;
  }
}
