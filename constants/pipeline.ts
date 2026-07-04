export const DEFAULT_BUSINESS_ID = 'test-biz-1'

export const DEFAULT_CITY_PLACEHOLDER = 'Enter city name (e.g. Lisbon)'

export const POLL_INTERVAL_MS = 1_500

export const POLL_TIMEOUT_MS = 5 * 60_000

export type PipelineRunStatus = 'pending' | 'running' | 'complete' | 'failed' | 'cancelled'

export const PIPELINE_RUN_STATUSES: readonly PipelineRunStatus[] = [
  'pending',
  'running',
  'complete',
  'failed',
  'cancelled',
] as const
