'use client';

import { useCallback, useState } from 'react';
import type { PipelineAgentRun, PipelineType } from '@/types/analysis';
import { isRateLimitError } from '@/lib/rate-limit-utils';

export interface UsePipelineRateLimitReturn {
  hasRateLimitError: boolean;
  failedRunError: string | null;
  isRetrying: boolean;
  handleRetry: (businessId: string, pipelineType: PipelineType, runFn: (id: string, type: PipelineType) => void) => Promise<void>;
  resetRetry: () => void;
  reset: () => void;
}

export function usePipelineRateLimit(agentRuns: PipelineAgentRun[]): UsePipelineRateLimitReturn {
  const [isRetrying, setIsRetrying] = useState(false);

  const failedRun = agentRuns.find((r) => r.status === 'failed' && r.error);
  const hasRateLimitError = failedRun?.error ? isRateLimitError(failedRun.error) : false;
  const failedRunError = failedRun?.error ?? null;

  const handleRetry = useCallback(
    async (businessId: string, pipelineType: PipelineType, runFn: (id: string, type: PipelineType) => void) => {
      if (!businessId || isRetrying) return;

      setIsRetrying(true);
      // Small delay to show the retrying state
      await new Promise((resolve) => setTimeout(resolve, 500));
      runFn(businessId, pipelineType);
    },
    [isRetrying]
  );

  const resetRetry = useCallback(() => {
    setIsRetrying(false);
  }, []);

  const reset = useCallback(() => {
    setIsRetrying(false);
  }, []);

  return {
    hasRateLimitError,
    failedRunError,
    isRetrying,
    handleRetry,
    resetRetry,
    reset,
  };
}
