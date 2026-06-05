'use client';

import { useCallback } from 'react';
import { fetchAnalysisStatus, type PipelineStatusResponse } from '@/lib/api/analysis';
import { usePolling } from './usePolling';
import { POLL_MS, TERMINAL_PIPELINE_STATUSES } from '@/constants/analysis';

export interface UseAnalysisStatusResult {
  data: PipelineStatusResponse | null;
  error: string | null;
  loading: boolean;
  stopped: boolean;
  stop: () => void;
  reset: () => void;
}

/**
 * Polls GET /api/analysis/[pipelineId] every POLL_MS.
 * Stops automatically when the pipeline reaches a terminal status
 * ('complete' or 'failed') or after the polling timeout.
 *
 * Pass `null` to disable polling (the hook returns nulls until a real id is given).
 */
export function useAnalysisStatus(
  pipelineId: string | null
): UseAnalysisStatusResult {
  const fetcher = useCallback(
    () => fetchAnalysisStatus(pipelineId as string),
    [pipelineId]
  );

  const result = usePolling<PipelineStatusResponse>(fetcher, {
    intervalMs: POLL_MS,
    enabled: pipelineId !== null,
    shouldStop: (next) =>
      TERMINAL_PIPELINE_STATUSES.has(
        (next as PipelineStatusResponse).status
      ),
  });

  return result;
}
