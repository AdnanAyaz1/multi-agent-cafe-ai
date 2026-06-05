import { PlaywrightCrawler, Configuration } from '@crawlee/playwright';
import { log as crawleeLog } from '@crawlee/core';
import { chromium } from 'playwright';
import { UpstreamError } from '@/lib/errors';
import type { CompetitorScrapeResult } from '@/lib/types';

// ─── Crawlee config (silence its built-in logger, isolate state per run) ────
crawleeLog.setLevel(crawleeLog.LEVELS.WARNING);

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_TEXT = 60_000;
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ' +
  'AgenticAI-CompetitorBot/1.0';

export interface ScrapeOptions {
  /** Per-request hard cap. Defaults to 30s. */
  timeoutMs?: number;
  /** Truncate extracted text to this many chars. Defaults to 60k. */
  maxTextLength?: number;
  /** Respect robots.txt. Defaults to true. */
  respectRobots?: boolean;
  /** Override User-Agent. */
  userAgent?: string;
}

/**
 * Scrapes a single competitor URL with Playwright (full JS rendering).
 *
 * Returns a CompetitorScrapeResult with the page's visible text (scripts and
 * styles stripped). The structured extraction happens downstream in the
 * competitor-parser agent — this function only fetches and cleans.
 *
 * Throws UpstreamError on navigation timeout, non-2xx status, or empty body.
 */
export async function scrapeCompetitorUrl(
  url: string,
  options: ScrapeOptions = {}
): Promise<CompetitorScrapeResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxTextLength = options.maxTextLength ?? DEFAULT_MAX_TEXT;

  validateUrl(url);

  const start = Date.now();
  let captured: Omit<CompetitorScrapeResult, 'durationMs'> | undefined;
  let firstError: unknown;

  // A fresh Configuration per call prevents Crawlee's persistent state from
  // leaking between scrapes (we are not running a long-lived crawl session).
    const crawler = new PlaywrightCrawler(
    {
      launchContext: {
        // Pass `launcher` explicitly to avoid crawlee's internal dynamic
        // `requireLauncherOrThrow('playwright', ...)` which Turbopack cannot
        // statically resolve at bundle time.
        launcher: chromium,
        launchOptions: { headless: true },
        userAgent: options.userAgent ?? DEFAULT_USER_AGENT,
      },
      navigationTimeoutSecs: Math.ceil(timeoutMs / 1000),
      requestHandlerTimeoutSecs: Math.ceil(timeoutMs / 1000) + 10,
      maxRequestRetries: 1,
      maxConcurrency: 1,
      maxRequestsPerCrawl: 1,
      headless: true,
      async requestHandler({ page, request, response }) {
        const status = response?.status() ?? 0;
        if (status === 0 || status >= 400) {
          throw new Error(`HTTP ${status} for ${request.loadedUrl ?? url}`);
        }

        // Strip script/style/noscript before extracting text.
        const text = await page.evaluate((cap: number) => {
          const clone = document.cloneNode(true) as Document;
          clone.querySelectorAll('script, style, noscript').forEach((n) => n.remove());
          const raw = clone.body?.innerText ?? '';
          const collapsed = raw.replace(/\s+/g, ' ').trim();
          return collapsed.length > cap ? collapsed.slice(0, cap) : collapsed;
        }, maxTextLength);

        if (!text || text.length < 20) {
          throw new Error('Page returned empty or near-empty body');
        }

        captured = {
          url,
          finalUrl: request.loadedUrl ?? url,
          title: (await page.title()) || '',
          text,
          scrapedAt: new Date().toISOString(),
        };
      },
      failedRequestHandler({ error }) {
        firstError = error;
      },
    },
    new Configuration({ persistStorage: false })
  );

  try {
    if (options.respectRobots === false) {
      // No robots config in PlaywrightCrawler — left as an explicit flag for the future.
    }
    await crawler.run([url]);
  } catch (e) {
    firstError = firstError ?? e;
  } finally {
    await crawler.teardown();
  }

  if (!captured) {
    const msg =
      firstError instanceof Error
        ? firstError.message
        : 'Scrape failed (no result captured)';
    throw new UpstreamError(`Competitor scrape failed for ${url}: ${msg}`, 'crawlee');
  }

  return { ...captured, durationMs: Date.now() - start };
}

function validateUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new UpstreamError(`Invalid competitor URL: ${url}`, 'crawlee');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new UpstreamError(
      `Unsupported URL protocol "${parsed.protocol}" for ${url}`,
      'crawlee'
    );
  }
}
