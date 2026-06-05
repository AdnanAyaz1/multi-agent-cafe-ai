import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { aiAnalysisQueue } from '@/lib/queues/data-queue';
import { prisma } from '@/lib/db';
import { analysisRunRequestSchema } from '@/lib/validators/analysis';
import { NotFoundError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { withApiHandler, parseJsonBody } from '@/lib/api/handler';
import { QUEUE_PRIORITY } from '@/constants/queues';

const log = logger.child('api:analysis/run');

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await parseJsonBody(request);
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
    { priority: QUEUE_PRIORITY.AI_ANALYSIS }
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
});
