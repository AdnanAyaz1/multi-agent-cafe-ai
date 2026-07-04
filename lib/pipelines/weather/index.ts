import 'server-only';
import { logger } from '@/lib/logger';
import { runMenuAnalyst } from '@/lib/agents/menu-analyst';
import { runWeatherAnalyst } from '@/lib/agents/weather-analyst';
import { runStrategist } from '@/lib/agents/strategist';
import { runCritic, criticHasBlockers } from '@/lib/agents/critic';
import { runSynthesizer, deriveFinalConfidence } from '@/lib/agents/synthesizer';
import { MAX_REVISIONS } from '@/lib/agents/models';
import { clearCancellationFlag } from '@/lib/pipelines/cancel';
import { classifyLLMError, isTerminalReason } from '@/lib/pipelines/errors';
import { runAbortableTuple } from '@/lib/pipelines/abort';
import { persistRecommendation } from '@/lib/pipelines/shared/helpers';
import { loadInputs } from './helpers';
import type {
  MenuAnalystOutput,
  WeatherAnalystOutput,
  StrategistOutput,
  CriticOutput,
  SynthesizerOutput,
} from '@/lib/agents/types';
import type { PipelineResult } from '@/lib/pipelines/shared/types';
import type { PipelineRunContext } from '@/lib/pipelines/shared/types';

const log = logger.child('pipelines.weather');

/**
 * Weather Pipeline
 *
 * Flow:
 *   1. Load weather snapshot + menu + competitor context
 *   2. Menu Analyst + Weather Analyst (abort-aware parallel)
 *   3. Strategist (with competitor awareness)
 *   4. Critic -> loop back to Strategist if blockers + revisions remain
 *   5. Synthesizer
 *   6. Persist Recommendation + RecommendationAction[] rows
 *
 * The pipeline respects the AbortSignal in ctx:
 *  - All agent calls receive the signal
 *  - Parallel agents are run via runAbortableParallel (one failure aborts siblings)
 *  - Sequential steps check throwIfCancelled() between each agent
 */
export async function runWeatherPipeline(
  ctx: PipelineRunContext
): Promise<PipelineResult> {
  const start = Date.now();
  log.info('weather pipeline start', { pipelineId: ctx.pipelineId, businessId: ctx.businessId });

  try {
    const { weather, menu, competitors } = await loadInputs(ctx);

    await ctx.throwIfCancelled();

    // Step 2: Run menu analyst + weather analyst in parallel.
    // If one hits a rate limit, runAbortableTuple aborts the other via combined signal.
    const [menuAnalysis, weatherAnalysis] = await runAbortableTuple(ctx, [
      (c) => runMenuAnalyst({ menu }, c).then((r) => r.output),
      (c) => runWeatherAnalyst({ weather }, c).then((r) => r.output),
    ]) as [MenuAnalystOutput, WeatherAnalystOutput];

    await ctx.throwIfCancelled();

    let strategist: StrategistOutput = (
      await runStrategist(
        { menuAnalysis, weatherAnalysis, rawMenu: menu, competitorData: competitors, revision: 0 },
        ctx
      )
    ).output;

    await ctx.throwIfCancelled();

    let critic: CriticOutput = (
      await runCritic(
        { menuAnalysis, weatherAnalysis, strategistOutput: strategist },
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
            weatherAnalysis,
            rawMenu: menu,
            competitorData: competitors,
            criticFeedback: critic,
            revision: revisions,
          },
          ctx
        )
      ).output;

      await ctx.throwIfCancelled();

      critic = (
        await runCritic(
          { menuAnalysis, weatherAnalysis, strategistOutput: strategist },
          ctx
        )
      ).output;
    }

    await ctx.throwIfCancelled();

    const synthesizer: SynthesizerOutput = (
      await runSynthesizer(
        {
          menuAnalysis,
          weatherAnalysis,
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
      'marketing',
      { menuAnalysis, weatherAnalysis }
    );

    const durationMs = Date.now() - start;
    log.info('weather pipeline complete', {
      pipelineId: ctx.pipelineId,
      recommendationId: recommendation.id,
      revisions,
      durationMs,
    });

    await clearCancellationFlag(ctx.pipelineId);

    return {
      pipelineId: ctx.pipelineId,
      recommendationId: recommendation.id,
      revisions,
      durationMs,
      pipelineType: 'weather',
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
