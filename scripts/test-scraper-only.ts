import 'dotenv/config';
import { scrapeCompetitorUrl } from '../lib/services/competitor/client';

async function main() {
  const url = process.argv[2] ?? 'https://example.com/';
  console.log(`Scraping ${url}...`);
  const start = Date.now();
  try {
    const result = await scrapeCompetitorUrl(url, { timeoutMs: 20_000 });
    console.log(`OK in ${Date.now() - start}ms`);
    console.log({
      title: result.title,
      finalUrl: result.finalUrl,
      textLength: result.text.length,
      preview: result.text.slice(0, 200),
      durationMs: result.durationMs,
    });
  } catch (e) {
    console.error('FAILED:', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main();
