import 'server-only';
import { logger } from '@/lib/logger';
import { weatherPipelineGraph } from './graph';
import { deriveFinalConfidence } from '@/lib/agents/synthesizer';
import { clearCancellationFlag } from '@/lib/pipelines/cancel';
import { classifyLLMError, isTerminalReason } from '@/lib/pipelines/errors';
import { persistRecommendation } from '@/lib/pipelines/shared/helpers';
import { loadInputs } from './helpers';
import type { PipelineResult, PipelineRunContext } from '@/lib/pipelines/shared/types';

const log = logger.child('pipelines.weather');

/**
 * Weather Pipeline executed via LangGraph.js
 *
 * Flow:
 *   1. Load weather snapshot + menu + competitor context
 *   2. LangGraph StateGraph Execution:
 *      - menuAnalyst & weatherAnalyst (Parallel Fan-out)
 *      - Fan-in to Strategist
 *      - Strategist -> Critic
 *      - Conditional loop back to Strategist if blockers exist (up to MAX_REVISIONS)
 *      - Synthesizer generates owner briefing
 *   3. Persist Recommendation + RecommendationAction[] rows
 */
export async function runWeatherPipeline(
  ctx: PipelineRunContext
): Promise<PipelineResult> {
  const start = Date.now();
  log.info('weather pipeline start (LangGraph.js)', {
    pipelineId: ctx.pipelineId,
    businessId: ctx.businessId,
  });

  try {
    const { weather, menu, competitors } = await loadInputs(ctx);

    await ctx.throwIfCancelled();

    // Execute state machine with LangGraph.js
    const graphResult = await weatherPipelineGraph.invoke(
      {
        ctx,
        menu,
        weather,
        competitors,
        revisions: 0,
      },
      {
        signal: ctx.signal,
      }
    );

    const strategist = graphResult.strategistOutput;
    const critic = graphResult.criticOutput;
    const synthesizer = graphResult.synthesizerOutput;
    const finalConfidence = deriveFinalConfidence(strategist.confidence, critic);

    const recommendation = await persistRecommendation(
      ctx,
      { strategist, critic, synthesizer, finalConfidence },
      'marketing',
      {
        menuAnalysis: graphResult.menuAnalysis,
        weatherAnalysis: graphResult.weatherAnalysis,
      }
    );

    const durationMs = Date.now() - start;
    log.info('weather pipeline complete (LangGraph.js)', {
      pipelineId: ctx.pipelineId,
      recommendationId: recommendation.id,
      revisions: graphResult.revisions,
      durationMs,
    });

    await clearCancellationFlag(ctx.pipelineId);

    return {
      pipelineId: ctx.pipelineId,
      recommendationId: recommendation.id,
      revisions: graphResult.revisions,
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
