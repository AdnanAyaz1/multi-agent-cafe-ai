import 'server-only';
import { randomUUID } from 'crypto';
import { Worker, type Job, UnrecoverableError } from 'bullmq';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { scrapeCompetitorUrl } from '@/lib/services/competitor/client';
import { runCompetitorParser } from '@/lib/agents/competitor-parser';
import { PipelineCancelledError } from '@/lib/pipelines/errors';
import { isPipelineCancelled } from '@/lib/pipelines/cancel';
import type { CompetitorData } from '@/lib/types';
import { redisConnection } from '@/lib/queues/connection';
import type { CompetitorJobData, CompetitorJobResult } from './types';

const globalForWorker = globalThis as unknown as {
  competitorWorker: Worker<CompetitorJobData, CompetitorJobResult> | undefined;
};

const log = logger.child('competitor-worker');

function createWorker(): Worker<CompetitorJobData, CompetitorJobResult> {
  const worker = new Worker<CompetitorJobData, CompetitorJobResult>(
    'competitor-collect',
    async (job: Job<CompetitorJobData>) => {
      const { businessId, url } = job.data;
      const pipelineId = job.data.pipelineId ?? randomUUID();
      job.log(`Scraping ${url} for ${businessId} (pipeline ${pipelineId})`);

      // Check if pipeline was cancelled before we start heavy work
      if (await isPipelineCancelled(pipelineId)) {
        log.info('skipping cancelled pipeline scrape', { pipelineId, url });
        throw new PipelineCancelledError('user_cancelled');
      }

      // 1. Scrape with Crawlee + Playwright (returns raw cleaned text).
      const scrape = await scrapeCompetitorUrl(url, {
        timeoutMs: job.data.timeoutMs,
        maxTextLength: job.data.maxTextLength,
      });
      job.log(
        `Scrape ok in ${scrape.durationMs}ms (${scrape.text.length} chars) — sending to parser`
      );

      // Check cancellation after scrape (scrape can be slow)
      if (await isPipelineCancelled(pipelineId)) {
        log.info('pipeline cancelled after scrape', { pipelineId, url });
        throw new PipelineCancelledError('user_cancelled');
      }

      // 2. Parse with the competitor-parser agent (LLM extraction, Zod-typed).
      const parseStart = Date.now();
      const parsed = await runCompetitorParser(
        { scrape },
        { pipelineId, businessId }
      );
      const parseMs = Date.now() - parseStart;

      // 3. Compose the domain snapshot and persist.
      const data: CompetitorData = {
        url: scrape.url,
        finalUrl: scrape.finalUrl,
        brand: parsed.output.brand ?? undefined,
        items: parsed.output.items.map((item) => ({
          ...item,
          isPromo: item.isPromo ?? false,
          category: item.category ?? undefined,
          price: item.price ?? undefined,
          currency: item.currency ?? undefined,
          description: item.description ?? undefined,
        })),
        promos: parsed.output.promos.map((promo) => ({
          ...promo,
          discountPercent: promo.discountPercent ?? undefined,
          validUntil: promo.validUntil ?? undefined,
        })),
        notes: parsed.output.notes,
        scrapedAt: scrape.scrapedAt,
      };

      const snapshot = await prisma.dataSnapshot.create({
        data: {
          businessId,
          source: 'competitors',
          data: JSON.parse(JSON.stringify(data)) as object,
          collectedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return {
        success: true,
        url,
        itemCount: parsed.output.items.length,
        promoCount: parsed.output.promos.length,
        snapshotId: snapshot.id,
        scrapeMs: scrape.durationMs,
        parseMs,
      };
    },
    {
      connection: redisConnection,
      concurrency: parseInt(process.env.COMPETITOR_CONCURRENCY ?? '2', 10),
      limiter: { max: 6, duration: 60_000 },
    }
  );

  worker.on('completed', (job, result) => {
    log.info('job completed', {
      jobId: job.id,
      businessId: job.data.businessId,
      url: result?.url,
      items: result?.itemCount,
      promos: result?.promoCount,
      scrapeMs: result?.scrapeMs,
      parseMs: result?.parseMs,
    });
  });

  worker.on('failed', (job, err) => {
    const error = err as unknown;

    // Cancellation: remove the job so BullMQ doesn't retry
    if (error instanceof PipelineCancelledError) {
      log.info('scrape cancelled', { pipelineId: job?.data?.pipelineId, url: job?.data?.url });
      job?.remove().catch(() => {});
      return;
    }

    if (error instanceof UnrecoverableError) {
      log.error('scrape failed (unrecoverable)', error, {
        jobId: job?.id,
        pipelineId: job?.data?.pipelineId,
      });
      return;
    }

    log.error('job failed', error instanceof Error ? error : new Error(String(error)), {
      jobId: job?.id,
      businessId: job?.data?.businessId,
      url: job?.data?.url,
    });
  });

  return worker;
}

export const competitorWorker =
  globalForWorker.competitorWorker ?? createWorker();

if (process.env.NODE_ENV !== 'production') {
  globalForWorker.competitorWorker = competitorWorker;
}
