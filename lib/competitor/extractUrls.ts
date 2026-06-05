/**
 * Reads the `competitorUrls` array off a Business.config blob.
 *
 * The `Business.config` column is a free-form JSON field, so this function
 * accepts `unknown` and narrows defensively. Returns an empty array when:
 *   - the config is null / not an object
 *   - the `competitorUrls` key is missing or not an array
 *   - every entry is filtered out (not a non-empty string)
 */
export function extractCompetitorUrls(config: unknown): string[] {
  if (!config || typeof config !== 'object') return [];
  const raw = (config as Record<string, unknown>).competitorUrls;
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is string => typeof u === 'string' && u.length > 0);
}
