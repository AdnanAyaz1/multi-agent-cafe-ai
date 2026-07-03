import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { analysisRunRequestSchema } from '@/lib/validators/analysis';
import { parseBody } from '@/lib/validators';
import { NotFoundError, ValidationError } from '@/lib/errors';
import handleError from '@/lib/handlers/errors';
import { logger } from '@/lib/logger';

const log = logger.child('api:analysis/run');

const isVercel = !!process.env.VERCEL;

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

    if (isVercel) {
      const { runPipeline } = await import('@/lib/pipelines');

      Promise.resolve()
        .then(() => runPipeline({ businessId, pipelineId, pipelineType }))
        .then((result) => {
          log.info('pipeline completed inline (Vercel)', {
            pipelineId,
            businessId,
            pipelineType,
            recommendationId: result.recommendationId,
            durationMs: result.durationMs,
          });
        })
        .catch((err) => {
          log.error('pipeline failed inline (Vercel)', {
            pipelineId,
            businessId,
            pipelineType,
            error: err instanceof Error ? err.message : String(err),
          });
        });
    } else {
      const { aiAnalysisQueue } = await import('@/lib/queues/data-queue');
      const job = await aiAnalysisQueue.add(
        'full-pipeline',
        { businessId, pipelineId, pipelineType },
        { priority: 2 }
      );

      log.info('pipeline enqueued', {
        pipelineId,
        businessId,
        pipelineType,
        jobId: job.id,
      });
    }

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
