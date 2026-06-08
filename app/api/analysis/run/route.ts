import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { aiAnalysisQueue } from '@/lib/queues/data-queue';
import { analysisRunRequestSchema } from '@/lib/validators/analysis';
import { parseBody } from '@/lib/validators';
import { NotFoundError, ValidationError } from '@/lib/errors';
import handleError from '@/lib/handlers/errors';
import { logger } from '@/lib/logger';

const log = logger.child('api:analysis/run');

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await parseBody(request, analysisRunRequestSchema);

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, city: true },
    });
    if (!business) throw new NotFoundError('Business');
    if (!business.city) {
      throw new ValidationError('Business has no city configured');
    }

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
    return handleError(error) as NextResponse;
  }
}
