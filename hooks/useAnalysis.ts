'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from '@/constants/pipeline';

export interface PipelineAgentRun {
  id: string;
  agentName: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  durationMs: number | null;
  tokenCount: number | null;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  output: unknown;
}

export interface PipelineRecommendation {
  id: string;
  summary: string;
  reasoning: string;
  confidence: string;
  category: string;
  priority: number;
  status: string;
  createdAt: string;
  criticNotes: unknown;
  actions: Array<{
    id: string;
    actionType: string;
    item: string;
    details: unknown;
  }>;
}

export interface PipelineStatusResponse {
  pipelineId: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  startedAt: string | null;
  completedAt: string | null;
  agentRuns: PipelineAgentRun[];
  recommendation: PipelineRecommendation | null;
}

export interface UseAnalysisState {
  pipelineId: string | null;
  status: PipelineStatusResponse | null;
  loading: boolean;
  error: string | null;
}

export type UseAnalysisResult = UseAnalysisState & {
  run: (businessId: string) => Promise<void>;
  cancel: () => void;
};

export function useAnalysis(): UseAnalysisResult {
  const [state, setState] = useState<UseAnalysisState>({
    pipelineId: null,
    status: null,
    loading: false,
    error: null,
  });

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingStartedAtRef = useRef<number>(0);

  const stopStatusPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  useEffect(() => stopStatusPolling, [stopStatusPolling]);

  const fetchPipelineStatus = useCallback(
    async (pipelineId: string): Promise<PipelineStatusResponse> => {
      const res = await fetch(`/api/analysis/${pipelineId}`);

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `status fetch failed (${res.status})`);
      }

      return (await res.json()) as PipelineStatusResponse;
    },
    []
  );

  const startStatusPolling = useCallback(
    (pipelineId: string) => {
      stopStatusPolling();

      pollingStartedAtRef.current = Date.now();

      const pollPipelineStatus = async () => {
        try {
          const status = await fetchPipelineStatus(pipelineId);

          setState((current) => ({ ...current, status, error: null }));

          if (status.status === 'complete' || status.status === 'failed') {
            stopStatusPolling();
            setState((current) => ({ ...current, loading: false }));
            return;
          }

          if (Date.now() - pollingStartedAtRef.current > POLL_TIMEOUT_MS) {
            stopStatusPolling();
            setState((current) => ({
              ...current,
              loading: false,
              error: 'Pipeline timed out after 5 minutes',
            }));
          }
        } catch (error) {
          stopStatusPolling();
          setState((current) => ({
            ...current,
            loading: false,
            error: error instanceof Error ? error.message : 'Polling failed',
          }));
        }
      };

      void pollPipelineStatus();

      pollingIntervalRef.current = setInterval(
        () => void pollPipelineStatus(),
        POLL_INTERVAL_MS
      );
    },
    [fetchPipelineStatus, stopStatusPolling]
  );

  const run = useCallback(
    async (businessId: string) => {
      setState({
        pipelineId: null,
        status: null,
        loading: true,
        error: null,
      });

      try {
        const res = await fetch('/api/analysis/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId }),
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `enqueue failed (${res.status})`);
        }

        const { pipelineId } = (await res.json()) as { pipelineId: string };

        setState((current) => ({ ...current, pipelineId }));
        startStatusPolling(pipelineId);
      } catch (error) {
        setState({
          pipelineId: null,
          status: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to start pipeline',
        });
      }
    },
    [startStatusPolling]
  );

  const cancel = useCallback(() => {
    stopStatusPolling();
    setState((current) => ({ ...current, loading: false }));
  }, [stopStatusPolling]);

  return { ...state, run, cancel };
}
