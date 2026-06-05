import type { PipelineStatus } from '@/lib/api/analysis';

export const DEFAULT_BUSINESS_ID = 'test-biz-1';

export const POLL_MS = 1500;
export const POLL_TIMEOUT_MS = 5 * 60_000;

/** Pipeline statuses that mean "no further polling needed". */
export const TERMINAL_PIPELINE_STATUSES: ReadonlySet<PipelineStatus> = new Set([
  'complete',
  'failed',
]);
