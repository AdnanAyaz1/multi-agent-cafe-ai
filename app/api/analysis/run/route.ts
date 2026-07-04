import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { analysisRunRequestSchema } from '@/lib/validators/analysis';
import { parseBody } from '@/lib/validators';
import { NotFoundError, ValidationError } from '@/lib/errors';
import handleError from '@/lib/handlers/errors';
import { inngest } from '@/lib/inngest/client';
import { logger } from '@/lib/logger';

const log = logger.child('api:analysis/run');

export async function POST(request: NextRequest) {
  try {
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
  } catch (error) {
    return handleError(error) as NextResponse;
  }
}
