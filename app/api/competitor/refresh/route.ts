import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { competitorCollectQueue } from '@/lib/queues/data-queue';
import { competitorRefreshRequestSchema } from '@/lib/validators/competitor';
import {
  AppError,
  NotFoundError,
  ValidationError,
} from '@/lib/errors';

interface EnqueueResult {
  jobId: string | undefined;
  url: string;
}

function extractCompetitorUrls(config: unknown): string[] {
  if (!config || typeof config !== 'object') return [];
  const raw = (config as Record<string, unknown>).competitorUrls;
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === 'string' && u.length > 0);
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    const { businessId, url, timeoutMs, maxTextLength } =
      competitorRefreshRequestSchema.parse(body);

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, config: true },
    });
    if (!business) throw new NotFoundError(`Business ${businessId}`);

    const urls = url ? [url] : extractCompetitorUrls(business.config);
    if (urls.length === 0) {
      throw new ValidationError(
        'No competitor URLs to scrape (request had no `url` and Business.config.competitorUrls is empty)'
      );
    }

    const pipelineId = randomUUID();
    const enqueued: EnqueueResult[] = [];
    for (const target of urls) {
      const job = await competitorCollectQueue.add(
        'competitor-scrape',
        {
          businessId,
          url: target,
          pipelineId,
          timeoutMs,
          maxTextLength,
        },
        { priority: 1 }
      );
      enqueued.push({ jobId: job.id, url: target });
    }

    return NextResponse.json(
      {
        pipelineId,
        businessId,
        enqueued,
        message: `${enqueued.length} competitor scrape job(s) accepted`,
      },
      { status: 202 }
    );
  } catch (error) {
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
    console.error('Unhandled API error:', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
