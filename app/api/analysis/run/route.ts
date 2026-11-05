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

  const { businessId, pipelineType, city, competitorUrl } = await parseBody(request, analysisRunRequestSchema);

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true, city: true, config: true },
  });
  if (!business) throw new NotFoundError('Business');

  const targetCity = city?.trim() || business.city;

  if (pipelineType === 'weather' && !targetCity) {
    throw new ValidationError('Business has no city configured and no city was provided');
  }

  if (pipelineType === 'competitor') {
    const config = business.config as Record<string, unknown> | null;
    const urls = config?.competitorUrls;
    const hasConfigured = Array.isArray(urls) && urls.length > 0;
    if (!hasConfigured && !competitorUrl) {
      throw new ValidationError('Business has no competitor URLs configured and no competitor URL was provided');
    }
  }

  const pipelineId = randomUUID();

  try {
    await inngest.send({
      name: 'pipeline/run',
      data: {
        businessId,
        pipelineId,
        pipelineType,
        ...(targetCity ? { city: targetCity } : {}),
        ...(competitorUrl ? { competitorUrl: competitorUrl.trim() } : {}),
      },
    });
  } catch (err) {
    log.warn('Could not dispatch Inngest event, running pipeline in background fallback', {
      error: err instanceof Error ? err.message : String(err),
      pipelineId,
    });
    // Fallback: run pipeline asynchronously in background
    const { runPipeline } = await import('@/lib/pipelines');
    runPipeline({
      businessId,
      pipelineId,
      pipelineType,
      ...(targetCity ? { city: targetCity } : {}),
      ...(competitorUrl ? { competitorUrl: competitorUrl.trim() } : {}),
    }).catch((e) => {
      log.error('Fallback background pipeline failed', e);
    });
  }

  log.info('pipeline dispatched', {
    pipelineId,
    businessId,
    pipelineType,
    city: targetCity,
    competitorUrl,
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
