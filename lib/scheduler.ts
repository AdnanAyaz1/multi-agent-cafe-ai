import { logger } from './logger';

const log = logger.child('scheduler');

/**
 * On Vercel, cron jobs are handled by Inngest cron triggers in lib/inngest/functions.ts.
 * This file is only used for self-hosted deployments where workers run as persistent processes.
 *
 * The cron functions are:
 *  - weatherFetchCron:  daily 6 AM (configurable via WEATHER_FETCH_CRON)
 *  - competitorScrapeCron: daily 8 AM (configurable via COMPETITOR_SCRAPE_CRON)
 *  - dailyAnalysisCron: daily 9 AM (configurable via DAILY_ANALYSIS_CRON)
 *
 * On Vercel, Inngest automatically invokes these based on the cron expressions.
 * No manual scheduler needed.
 */

export function startScheduler(): void {
  log.info('scheduler skipped — using Inngest cron triggers');
}
