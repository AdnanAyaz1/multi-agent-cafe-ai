import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { randomUUID } from 'crypto';
import { aiAnalysisQueue } from '@/lib/queues/data-queue';
import { prisma } from '@/lib/db';
import { analysisRunRequestSchema } from '@/lib/validators/analysis';
import { AppError, NotFoundError, ValidationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

const log = logger.child('api:analysis/run');

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    const { businessId } = analysisRunRequestSchema.parse(body);

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true },
    });
    if (!business) throw new NotFoundError('Business');

    const pipelineId = randomUUID();
    const job = await aiAnalysisQueue.add(
      'full-pipeline',
      { businessId, pipelineId },
      { priority: 2 }
    );

    log.info('pipeline enqueued', {
      pipelineId,
      businessId,
      jobId: job.id,
    });

    return NextResponse.json(
      {
        pipelineId,
        jobId: job.id,
        status: 'queued',
        statusUrl: `/api/analysis/${pipelineId}`,
      },
      { status: 202 }
    );
  } catch (error) {
    return errorResponse(error);
  }
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
