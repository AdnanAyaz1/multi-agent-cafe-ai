import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { analysisRunRequestSchema } from '@/lib/validators/analysis';
import { parseBody } from '@/lib/validators';
import { NotFoundError, UnauthorizedError, ValidationError } from '@/lib/errors';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { inngest } from '@/lib/inngest/client';
import { logger } from '@/lib/logger';

const log = logger.child('api:analysis/run');

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const { businessId, pipelineType } = await parseBody(request, analysisRunRequestSchema);

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, city: true, config: true },
  });
  if (!business) throw new NotFoundError('Business');

  if (pipelineType === 'weather' && !business.city) {
    throw new ValidationError('Business has no city configured');
  }

  if (pipelineType === 'competitor') {
    const config = business.config as Record<string, unknown> | null;
    const urls = config?.competitorUrls;
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new ValidationError('Business has no competitor URLs configured');
    }
  }

  const pipelineId = randomUUID();

  await inngest.send({
    name: 'pipeline/run',
    data: { businessId, pipelineId, pipelineType },
  });

  log.info('pipeline dispatched', {
    pipelineId,
    businessId,
    pipelineType,
  });

  return NextResponse.json(
    {
      pipelineId,
      pipelineType,
      status: 'queued',
      statusUrl: `/api/analysis/${pipelineId}`,
    },
    { status: 202 }
  );
});
