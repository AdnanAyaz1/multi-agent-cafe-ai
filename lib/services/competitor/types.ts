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
