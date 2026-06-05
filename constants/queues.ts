export const QUEUE_PRIORITY = {
  /** Bulk data ingestion (weather, competitors). Lower urgency. */
  DATA_COLLECT: 1,
  /** LLM-driven analysis pipeline. Higher urgency — user is waiting. */
  AI_ANALYSIS: 2,
} as const;

export type QueuePriority =
  (typeof QUEUE_PRIORITY)[keyof typeof QUEUE_PRIORITY];

/** Default page size when client omits ?limit= on the competitor snapshot list. */
export const COMPETITOR_SNAPSHOT_DEFAULT_LIMIT = 10;
