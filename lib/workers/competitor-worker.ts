import 'server-only';
import { randomUUID } from 'crypto';
import { Worker, type Job } from 'bullmq';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { scrapeCompetitorUrl } from '@/lib/services/competitor/client';
import { runCompetitorParser } from '@/lib/agents/competitor-parser';
import type { CompetitorData } from '@/lib/types';

export interface CompetitorJobData {
  businessId: string;
  url: string;
  /** Optional caller-supplied pipeline id (so multiple URLs share one AgentRun group). */
  pipelineId?: string;
  /** Optional scrape options forwarded to the scraper. */
  timeoutMs?: number;
  maxTextLength?: number;
}

export interface CompetitorJobResult {
  success: true;
  url: string;
  itemCount: number;
  promoCount: number;
  snapshotId: string;
  scrapeMs: number;
  parseMs: number;
}

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
};

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

      // 1. Scrape with Crawlee + Playwright (returns raw cleaned text).
      const scrape = await scrapeCompetitorUrl(url, {
        timeoutMs: job.data.timeoutMs,
        maxTextLength: job.data.maxTextLength,
      });
      job.log(
        `Scrape ok in ${scrape.durationMs}ms (${scrape.text.length} chars) — sending to parser`
      );

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
        brand: parsed.output.brand,
        items: parsed.output.items,
        promos: parsed.output.promos,
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
      connection,
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
    log.error('job failed', err, {
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
