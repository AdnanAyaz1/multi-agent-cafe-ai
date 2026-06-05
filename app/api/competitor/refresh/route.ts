import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { competitorCollectQueue } from '@/lib/queues/data-queue';
import { competitorRefreshRequestSchema } from '@/lib/validators/competitor';
import { NotFoundError, ValidationError } from '@/lib/errors';
import { withApiHandler, parseJsonBody } from '@/lib/api/handler';
import { QUEUE_PRIORITY } from '@/constants/queues';
import { extractCompetitorUrls } from '@/lib/competitor/extractUrls';

interface EnqueueResult {
  jobId: string | undefined;
  url: string;
}

export const POST = withApiHandler(async (request: NextRequest) => {
  const body = await parseJsonBody(request);
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
      { priority: QUEUE_PRIORITY.DATA_COLLECT }
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
});
