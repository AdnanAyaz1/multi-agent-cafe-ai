/**
 * Rate limit detection and messaging utilities.
 */

/**
 * Detect if an error message is rate-limit or quota related.
 */
export function isRateLimitError(error: string): boolean {
  const lower = error.toLowerCase();
  return (
    lower.includes('rate limit') ||
    lower.includes('rate_limit') ||
    lower.includes('429') ||
    lower.includes('quota exceeded') ||
    lower.includes('tokens per minute') ||
    lower.includes('requests per minute')
  );
}

/**
 * Detect if an error is a temporary rate limit (retry-able) vs permanent quota exceeded.
 */
export function isRetryableRateLimit(error: string): boolean {
  const lower = error.toLowerCase();
  // Permanent quota issues
  if (lower.includes('quota exceeded') || lower.includes('billing')) {
    return false;
  }
  // Temporary rate limits (429)
  return isRateLimitError(error);
}

/**
 * Get a user-friendly error message for rate limit errors.
 */
export function getRateLimitMessage(error: string): { title: string; description: string } {
  const lower = error.toLowerCase();

  if (lower.includes('quota exceeded') || lower.includes('billing')) {
    return {
      title: 'API Quota Exceeded',
      description: 'You\'ve reached the API usage limit. Please wait a few minutes or upgrade your plan.',
    };
  }

  if (lower.includes('tokens per minute')) {
    return {
      title: 'Token Rate Limit',
      description: 'Too many tokens requested. The pipeline will retry automatically.',
    };
  }

  if (lower.includes('requests per minute')) {
    return {
      title: 'Request Rate Limit',
      description: 'Too many requests. The pipeline will retry automatically.',
    };
  }

  return {
    title: 'Rate Limit Reached',
    description: 'The API is temporarily busy. Please try again in a moment.',
  };
}
