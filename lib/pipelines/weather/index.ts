import 'server-only';
import { logger } from '@/lib/logger';
import { runMenuAnalyst } from '@/lib/agents/menu-analyst';
import { runWeatherAnalyst } from '@/lib/agents/weather-analyst';
import { runStrategist } from '@/lib/agents/strategist';
import { runCritic, criticHasBlockers } from '@/lib/agents/critic';
import { runSynthesizer, deriveFinalConfidence } from '@/lib/agents/synthesizer';
import { MAX_REVISIONS } from '@/lib/agents/models';
import { isPipelineCancelled, clearCancellationFlag } from '@/lib/pipelines/cancel';
import { persistRecommendation } from '@/lib/pipelines/shared/helpers';
import { loadInputs } from './helpers';
import type {
  StrategistOutput,
  CriticOutput,
  SynthesizerOutput,
} from '@/lib/agents/types';
import type { PipelineContext, PipelineResult } from '@/lib/pipelines/shared/types';

const log = logger.child('pipelines.weather');

/**
 * Weather Pipeline
 *
 * Flow:
 *   1. Load weather snapshot + menu + competitor context
 *   2. Menu Analyst + Weather Analyst (parallel)
 *   3. Strategist (with competitor awareness)
 *   4. Critic -> loop back to Strategist if blockers + revisions remain
 *   5. Synthesizer
 *   6. Persist Recommendation + RecommendationAction[] rows
 */
export async function runWeatherPipeline(
  context: PipelineContext
): Promise<PipelineResult> {
  const start = Date.now();
  log.info('weather pipeline start', { ...context });

  try {
    const { weather, menu, competitors } = await loadInputs(context);

    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

    const [menuAnalysis, weatherAnalysis] = await Promise.all([
      runMenuAnalyst({ menu }, context).then((r) => r.output),
      runWeatherAnalyst({ weather }, context).then((r) => r.output),
    ]);

    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

    let strategist: StrategistOutput = (
      await runStrategist(
        { menuAnalysis, weatherAnalysis, rawMenu: menu, competitorData: competitors, revision: 0 },
        context
      )
    ).output;

    if (await isPipelineCancelled(context.pipelineId)) {
      throw 'Pipeline cancelled by user';
    }

    let critic: CriticOutput = (
      await runCritic(
        { menuAnalysis, weatherAnalysis, strategistOutput: strategist },
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
            weatherAnalysis,
            rawMenu: menu,
            competitorData: competitors,
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
          { menuAnalysis, weatherAnalysis, strategistOutput: strategist },
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
          weatherAnalysis,
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
      'marketing',
      { menuAnalysis, weatherAnalysis }
    );

    const durationMs = Date.now() - start;
    log.info('weather pipeline complete', {
      pipelineId: context.pipelineId,
      recommendationId: recommendation.id,
      revisions,
      durationMs,
    });

    await clearCancellationFlag(context.pipelineId);

    return {
      pipelineId: context.pipelineId,
      recommendationId: recommendation.id,
      revisions,
      durationMs,
      pipelineType: 'weather',
    };
  } catch (error) {
    throw error;
  }
}
