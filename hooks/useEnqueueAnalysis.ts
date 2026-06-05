'use client';

import { useCallback, useState } from 'react';
import { enqueueAnalysis, type EnqueueAnalysisResponse } from '@/lib/api/analysis';

export interface UseEnqueueAnalysisResult {
  data: EnqueueAnalysisResponse | null;
  loading: boolean;
  error: string | null;
  run: (businessId: string) => Promise<EnqueueAnalysisResponse | null>;
  reset: () => void;
}

/**
 * Calls POST /api/analysis/run. Returns the enqueue response (with pipelineId)
 * on success, or null on validation error. Errors are also surfaced via `error`.
 */
export function useEnqueueAnalysis(): UseEnqueueAnalysisResult {
  const [data, setData] = useState<EnqueueAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (businessId: string): Promise<EnqueueAnalysisResponse | null> => {
      const trimmed = businessId.trim();
      if (!trimmed) {
        setError('Business ID is required');
        return null;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await enqueueAnalysis(trimmed);
        setData(result);
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to start pipeline');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, run, reset };
}
