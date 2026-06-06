import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { prisma } from '@/lib/db';
import { pipelineIdSchema } from '@/lib/validators/analysis';
import { AppError, NotFoundError } from '@/lib/errors';
import type {
  AgentName,
  PipelineStatus,
} from '@/lib/agents/types';
import { AGENT_NAMES } from '@/lib/agents/types';
import { logger } from '@/lib/logger';

const log = logger.child('api:analysis/status');

interface AgentRunSummary {
  id: string;
  agentName: AgentName;
  status: string;
  durationMs: number | null;
  tokenCount: number | null;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  output: unknown;
}

interface RecommendationSummary {
  id: string;
  summary: string;
  reasoning: string;
  confidence: string;
  category: string;
  priority: number;
  status: string;
  createdAt: string;
  actions: Array<{
    id: string;
    actionType: string;
    item: string;
    details: unknown;
  }>;
  criticNotes: unknown;
}

interface PipelineStatusResponse {
  pipelineId: string;
  status: PipelineStatus;
  startedAt: string | null;
  completedAt: string | null;
  agentRuns: AgentRunSummary[];
  recommendation: RecommendationSummary | null;
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/analysis/[pipelineId]'>
) {
  try {
    const { pipelineId } = await ctx.params;
    const validId = pipelineIdSchema.parse(pipelineId);

    const runs = await prisma.agentRun.findMany({
      where: { pipelineId: validId },
      orderBy: { createdAt: 'asc' },
    });

    if (runs.length === 0) throw new NotFoundError('Pipeline');

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
    if (completedSynthesizer) {
      const rec = await findRecommendationForPipeline(validId);
      if (rec) {
        recommendation = {
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
    }

    const status = derivePipelineStatus(runs.map((r) => r.status), AGENT_NAMES.length);
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
    return errorResponse(error);
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

async function findRecommendationForPipeline(pipelineId: string) {
  const rec = await prisma.recommendation.findFirst({
    where: {
      dataAnalysis: { path: ['pipelineId'], equals: pipelineId },
    },
    include: { actions: true },
    orderBy: { date: 'desc' },
  });
  return rec;
}

function errorResponse(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
      { status: error.statusCode }
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.flatten(),
      },
      { status: 400 }
    );
  }
  log.error('unhandled', error);
  const message =
    error instanceof Error ? error.message : 'Internal server error';
  return NextResponse.json(
    { error: message, code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
