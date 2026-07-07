import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { pipelineIdSchema } from '@/lib/validators/analysis';
import { NotFoundError } from '@/lib/errors';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { cancelPipeline, getPipelineCancelReason } from '@/lib/pipelines/cancel';
import type {
  PipelineStatus,
} from '@/lib/agents/types';
import { PIPELINE_AGENT_COUNT } from '@/lib/agents/types';
import { logger } from '@/lib/logger';
import type {
  PipelineStatusResponse,
  RawAgentRun,
  RawRecommendation,
  PipelineAgentRun,
  PipelineRecommendation,
} from '@/types/analysis';

const log = logger.child('api:analysis/status');

export const GET = withErrorHandling(async (
  _request: NextRequest,
  ctx: RouteContext<'/api/analysis/[pipelineId]'>
) => {
  const { pipelineId } = await ctx.params;
  const validId = pipelineIdSchema.parse(pipelineId);

  const runs: RawAgentRun[] = await prisma.agentRun.findMany({
    where: { pipelineId: validId },
    orderBy: { createdAt: 'asc' },
  }) as unknown as RawAgentRun[];

  const rec = await findRecommendationForPipeline(validId);

  if (runs.length === 0 && !rec) throw new NotFoundError('Pipeline');

  if (runs.length === 0 && rec) {
    const recFormatted = formatRecommendation(rec);
    const body: PipelineStatusResponse = {
      status: 'complete',
      agentRuns: [],
      recommendation: recFormatted,
    };
    return NextResponse.json(body);
  }

  const agentRuns: PipelineAgentRun[] = runs.map((r) => ({
    id: r.id,
    agentName: r.agentName as string,
    status: r.status,
    durationMs: r.durationMs ?? undefined,
    tokenCount: r.tokenCount ?? undefined,
    error: r.error ?? undefined,
  }));

  let recommendation: PipelineRecommendation | undefined = undefined;
  const completedSynthesizer = runs.find(
    (r) => r.agentName === 'synthesizer' && r.status === 'complete'
  );
  if (completedSynthesizer && rec) {
    recommendation = formatRecommendation(rec);
  }

  const cancelReason = await getPipelineCancelReason(validId);
  const hasRunning = runs.some((s) => s.status === 'running' || s.status === 'pending');

  let status: PipelineStatus;

  if (cancelReason && hasRunning) {
    status = 'cancelling' as PipelineStatus;
  } else {
    status = derivePipelineStatus(runs.map((r) => r.status), PIPELINE_AGENT_COUNT, runs);
  }

  const body: PipelineStatusResponse = {
    status,
    agentRuns,
    recommendation,
  };
  return NextResponse.json(body);
});

export const DELETE = withErrorHandling(async (
  _request: NextRequest,
  ctx: RouteContext<'/api/analysis/[pipelineId]'>
) => {
  const { pipelineId } = await ctx.params;
  const validId = pipelineIdSchema.parse(pipelineId);

  const cancelled = await cancelPipeline(validId, 'user_cancelled');

  log.info('pipeline cancel requested', {
    pipelineId: validId,
    cancelled,
  });

  return NextResponse.json({ success: true, cancelled });
});

function derivePipelineStatus(
  runStatuses: string[],
  expectedMin: number,
  agentRuns?: RawAgentRun[]
): PipelineStatus {
  const hasFailed = runStatuses.some((s) => s === 'failed');
  const hasCompleted = runStatuses.some((s) => s === 'complete');
  const hasRunning = runStatuses.some((s) => s === 'running' || s === 'pending');

  if (hasFailed && !hasCompleted && !hasRunning && agentRuns) {
    const allCancelled = agentRuns
      .filter((r) => r.status === 'failed')
      .every((r) => r.error?.startsWith('Pipeline cancelled:') || r.error === 'Pipeline cancelled by user');
    if (allCancelled) return 'cancelled' as PipelineStatus;
  }

  if (hasFailed) return 'failed';
  if (hasRunning) return 'running';
  const completed = runStatuses.filter((s) => s === 'complete').length;
  if (completed >= expectedMin) return 'complete';
  return 'running';
}

function formatRecommendation(rec: RawRecommendation): PipelineRecommendation {
  return {
    id: rec.id,
    summary: rec.summary,
    reasoning: rec.reasoning,
    confidence: rec.confidence,
    category: rec.category,
    priority: rec.priority,
    status: rec.status,
    createdAt: rec.date.toISOString(),
    criticNotes: rec.criticNotes,
    actions: rec.actions.map((a) => ({
      id: a.id,
      actionType: a.actionType,
      item: a.item,
      details: a.details as PipelineRecommendation['actions'][number]['details'],
    })),
  };
}

async function findRecommendationForPipeline(pipelineId: string): Promise<RawRecommendation | null> {
  const rec = await prisma.recommendation.findFirst({
    where: {
      dataAnalysis: { path: ['pipelineId'], equals: pipelineId },
    },
    include: { actions: true },
    orderBy: { date: 'desc' },
  });
  return rec as unknown as RawRecommendation | null;
}
