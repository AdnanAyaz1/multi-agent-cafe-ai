export const COMPETITOR_POLL_INTERVAL_MS = 2_500;
export const COMPETITOR_POLL_TIMEOUT_MS = 2 * 60_000;

export const COMPETITOR_DEFAULT_LIMIT = 5;

export const COMPETITOR_FORM_DEFAULTS = {
  timeoutMs: 30_000,
  maxTextLength: 60_000,
} as const;

export const COMPETITOR_URL_OVERRIDE_PLACEHOLDER =
  'https://example-cafe.com/menu (optional — leave blank to use Business.config.competitorUrls)';
