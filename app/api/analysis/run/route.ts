import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { Queue, QueueEvents } from 'bullmq';
import { aiAnalysisQueue } from '@/lib/queues/data-queue';
import { prisma } from '@/lib/db';
import { analysisRunRequestSchema } from '@/lib/validators/analysis';
import { NotFoundError, ValidationError, UpstreamError } from '@/lib/errors';
import handleError from '@/lib/handlers/errors';
import { logger } from '@/lib/logger';

const log = logger.child('api:analysis/run');

const WEATHER_FETCH_TIMEOUT_MS = 30_000;
const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
};

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
      select: {
        id: true,
        city: true,
        latitude: true,
        longitude: true,
      },
    });
    if (!business) throw new NotFoundError('Business');
    if (!business.city) {
      throw new ValidationError('Business has no city configured');
    }

    await ensureWeatherSnapshot(business);

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

async function ensureWeatherSnapshot(
  business: { id: string; city: string; latitude: number | null; longitude: number | null }
): Promise<void> {
  const fresh = await prisma.dataSnapshot.findFirst({
    where: {
      businessId: business.id,
      source: 'weather',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { collectedAt: 'desc' },
  });
  if (fresh) return;

  log.info('no fresh weather snapshot - fetching', {
    businessId: business.id,
    city: business.city,
  });

  const queue = new Queue('data-collect', { connection });
  const events = new QueueEvents('data-collect', { connection });
  try {
    await events.waitUntilReady();
    const job = await queue.add(
      'weather-fetch',
      {
        businessId: business.id,
        city: business.city,
        latitude: business.latitude ?? undefined,
        longitude: business.longitude ?? undefined,
      },
      { priority: 1 }
    );
    await job.waitUntilFinished(events, WEATHER_FETCH_TIMEOUT_MS);
    log.info('weather snapshot ready', {
      businessId: business.id,
      jobId: job.id,
    });
  } catch (e) {
    const reason = e instanceof Error ? e.message : 'unknown error';
    log.error('weather fetch failed', e, { businessId: business.id });
    throw new UpstreamError(
      `Failed to fetch weather for "${business.city}": ${reason}`,
      'weather'
    );
  } finally {
    await events.close();
    await queue.close();
  }
}
