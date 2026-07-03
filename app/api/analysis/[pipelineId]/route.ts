import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { pipelineIdSchema } from '@/lib/validators/analysis';
import { NotFoundError } from '@/lib/errors';
import handleError from '@/lib/handlers/errors';
import type {
  AgentName,
  PipelineStatus,
} from '@/lib/agents/types';
import { PIPELINE_AGENT_COUNT } from '@/lib/agents/types';
import { logger } from '@/lib/logger';
import type {
  AgentRunSummary,
  RecommendationSummary,
  PipelineStatusResponse,
  RawAgentRun,
  RawRecommendation,
} from '@/types/analysis';

const log = logger.child('api:analysis/status');

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/analysis/[pipelineId]'>
) {
  try {
    const { pipelineId } = await ctx.params;
    const validId = pipelineIdSchema.parse(pipelineId);

    const runs: RawAgentRun[] = await prisma.agentRun.findMany({
      where: { pipelineId: validId },
      orderBy: { createdAt: 'asc' },
    }) as unknown as RawAgentRun[];

    // Find the recommendation for this pipeline
    const rec = await findRecommendationForPipeline(validId);

    // If no agent runs and no recommendation, pipeline doesn't exist
    if (runs.length === 0 && !rec) throw new NotFoundError('Pipeline');

    // For competitor pipelines (no agent runs), derive status from recommendation
    if (runs.length === 0 && rec) {
      const body: PipelineStatusResponse = {
        pipelineId: validId,
        status: 'complete',
        startedAt: rec.date.toISOString(),
        completedAt: rec.date.toISOString(),
        agentRuns: [],
        recommendation: formatRecommendation(rec),
      };
      return NextResponse.json(body);
    }

    // For weather pipelines (has agent runs)
    const agentRuns: AgentRunSummary[] = runs.map((r) => ({
      id: r.id,
      agentName: r.agentName as AgentName,
      status: r.status,
      durationMs: r.durationMs,
      tokenCount: r.tokenCount,
      startedAt: r.startedAt?.toISOString() ?? null,
      completedAt: r.completedAt?.toISOString() ?? null,
      error: r.error,
      output: r.output,
    }));

    let recommendation: RecommendationSummary | null = null;
    const completedSynthesizer = runs.find(
      (r) => r.agentName === 'synthesizer' && r.status === 'complete'
    );
    if (completedSynthesizer && rec) {
      recommendation = formatRecommendation(rec);
    }

    const status = derivePipelineStatus(runs.map((r) => r.status), PIPELINE_AGENT_COUNT);
    const startedAt = runs[0]?.startedAt?.toISOString() ?? null;
    const completedAt =
      status === 'complete'
        ? runs[runs.length - 1]?.completedAt?.toISOString() ?? null
        : null;

    const body: PipelineStatusResponse = {
      pipelineId: validId,
      status,
      startedAt,
      completedAt,
      agentRuns,
      recommendation,
    };
    return NextResponse.json(body);
  } catch (error) {
    return handleError(error) as NextResponse;
  }
}

function derivePipelineStatus(
  runStatuses: string[],
  expectedMin: number
): PipelineStatus {
  if (runStatuses.some((s) => s === 'failed')) return 'failed';
  if (runStatuses.some((s) => s === 'running' || s === 'pending')) return 'running';
  const completed = runStatuses.filter((s) => s === 'complete').length;
  if (completed >= expectedMin) return 'complete';
  return 'running';
}

function formatRecommendation(rec: RawRecommendation): RecommendationSummary {
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
      details: a.details,
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
