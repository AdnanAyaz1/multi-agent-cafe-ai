import 'server-only';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { competitorPipelineGraph } from './graph';
import { deriveFinalConfidence } from '@/lib/agents/synthesizer';
import { clearCancellationFlag } from '@/lib/pipelines/cancel';
import { classifyLLMError, isTerminalReason } from '@/lib/pipelines/errors';
import { persistRecommendation } from '@/lib/pipelines/shared/helpers';
import { extractCompetitorUrls, loadInputs } from './helpers';
import type { PipelineResult, PipelineRunContext } from '@/lib/pipelines/shared/types';

const log = logger.child('pipelines.competitor');

/**
 * Competitor Pipeline executed via LangGraph.js
 *
 * Flow:
 *   1. Load business menu + scrape competitor URLs
 *   2. LangGraph StateGraph Execution:
 *      - parseCompetitors in parallel
 *      - competitorAnalyst & menuAnalyst in parallel
 *      - Fan-in to Strategist
 *      - Strategist -> Critic
 *      - Cyclic feedback loop if blockers exist (up to MAX_REVISIONS)
 *      - Synthesizer creates final briefing
 *   3. Persist Recommendation + RecommendationAction[]
 */
export async function runCompetitorPipeline(
  ctx: PipelineRunContext
): Promise<PipelineResult> {
  const start = Date.now();
  log.info('competitor pipeline start (LangGraph.js)', {
    pipelineId: ctx.pipelineId,
    businessId: ctx.businessId,
    competitorUrl: ctx.competitorUrl,
  });

  try {
    const business = await prisma.business.findUnique({
      where: { id: ctx.businessId },
      select: { id: true, config: true },
    });
    if (!business) throw new NotFoundError('Business');

    const configuredUrls = extractCompetitorUrls(business.config);
    const targetUrl = ctx.competitorUrl?.trim();
    const urls = targetUrl ? [targetUrl] : configuredUrls;

    if (urls.length === 0) {
      throw new ValidationError('No competitor URLs configured or selected for this business');
    }

    const { menu, competitorSnapshots } = await loadInputs(ctx, urls);
    log.info('competitor data collected', {
      pipelineId: ctx.pipelineId,
      snapshotCount: competitorSnapshots.length,
      targetUrl,
    });

    await ctx.throwIfCancelled();

    // Execute state machine with LangGraph.js
    const graphResult = await competitorPipelineGraph.invoke(
      {
        ctx,
        menu,
        competitorSnapshots,
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
      'competitor',
      {
        competitorUrl: targetUrl || competitorSnapshots[0]?.url || urls[0],
        competitorBrand: competitorSnapshots[0]?.brand ?? undefined,
        competitorUrls: urls,
        menuAnalysis: graphResult.menuAnalysis,
        competitorAnalysis: graphResult.competitorAnalysis,
      }
    );

    const durationMs = Date.now() - start;
    log.info('competitor pipeline complete (LangGraph.js)', {
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
