import { UpstreamError } from '@/lib/errors';
import type { CompetitorScrapeResult } from '@/lib/types';
import type { ScrapeOptions } from './types';

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_TEXT = 60_000;

/**
 * Scrapes a competitor URL using ScrapingBee's API (Vercel-compatible).
 * Falls back to Playwright locally if SCRAPINGBEE_API_KEY is not set.
 */
export async function scrapeCompetitorUrl(
  url: string,
  options: ScrapeOptions = {}
): Promise<CompetitorScrapeResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxTextLength = options.maxTextLength ?? DEFAULT_MAX_TEXT;

  validateUrl(url);

  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  if (apiKey) {
    return scrapeWithScrapingBee(url, apiKey, timeoutMs, maxTextLength);
  }

  // Fallback to Playwright for local development
  return scrapeWithPlaywright(url, options, timeoutMs, maxTextLength);
}

async function scrapeWithScrapingBee(
  url: string,
  apiKey: string,
  timeoutMs: number,
  maxTextLength: number
): Promise<CompetitorScrapeResult> {
  const start = Date.now();
  const params = new URLSearchParams({
    url,
    render_js: 'true',
    return_page_text: 'true',
    wait: '2000',
    timeout: String(Math.min(timeoutMs, 30000)),
  });

  const response = await fetch(`https://app.scrapingbee.com/api/v1?${params}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new UpstreamError(
      `ScrapingBee failed for ${url}: ${response.status} ${body}`,
      'scrapingbee'
    );
  }

  const text = await response.text();

  if (!text || text.length < 20) {
    throw new UpstreamError(`ScrapingBee returned empty body for ${url}`, 'scrapingbee');
  }

  const truncated = text.length > maxTextLength ? text.slice(0, maxTextLength) : text;

  return {
    url,
    finalUrl: url,
    title: '',
    text: truncated,
    scrapedAt: new Date().toISOString(),
    durationMs: Date.now() - start,
  };
}

async function scrapeWithPlaywright(
  url: string,
  options: ScrapeOptions,
  timeoutMs: number,
  maxTextLength: number
): Promise<CompetitorScrapeResult> {
  const [{ PlaywrightCrawler, Configuration }, { log: crawleeLog }, { chromium }] = await Promise.all([
    import('@crawlee/playwright'),
    import('@crawlee/core'),
    import('playwright'),
  ]);

  crawleeLog.setLevel(crawleeLog.LEVELS.WARNING);

  const start = Date.now();
  let captured: Omit<CompetitorScrapeResult, 'durationMs'> | undefined;
  let firstError: unknown;

  const crawler = new PlaywrightCrawler(
    {
      launchContext: {
        launcher: chromium,
        launchOptions: { headless: true },
        userAgent: options.userAgent ??
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
