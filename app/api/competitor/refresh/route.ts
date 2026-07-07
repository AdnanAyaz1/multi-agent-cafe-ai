import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { competitorRefreshRequestSchema } from '@/lib/validators/competitor';
import { parseBody } from '@/lib/validators';
import { NotFoundError, UnauthorizedError, ValidationError } from '@/lib/errors';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { inngest } from '@/lib/inngest/client';
import type { EnqueueResult } from '@/types/competitor';

function extractCompetitorUrls(config: unknown): string[] {
  if (!config || typeof config !== 'object') return [];
  const raw = (config as Record<string, unknown>).competitorUrls;
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === 'string' && u.length > 0);
}

export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();

  const { businessId, url, timeoutMs, maxTextLength } = await parseBody(
    request,
    competitorRefreshRequestSchema
  );

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

  await inngest.send(
    urls.map((target) => ({
      name: 'competitor/scrape' as const,
      data: {
        businessId,
        url: target,
        pipelineId,
        timeoutMs,
        maxTextLength,
      },
    }))
  );

  for (const target of urls) {
    enqueued.push({ jobId: `inngest-${pipelineId}`, url: target });
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
