'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PipelineAgentRun {
  id: string;
  agentName: string;
  status: string;
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

interface UseAnalysisState {
  pipelineId: string | null;
  status: PipelineStatusResponse | null;
  loading: boolean;
  error: string | null;
}

const POLL_MS = 1500;
const POLL_LIMIT_MS = 5 * 60_000;

export function useAnalysis() {
  const [state, setState] = useState<UseAnalysisState>({
    pipelineId: null,
    status: null,
    loading: false,
    error: null,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const fetchStatus = useCallback(
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

  const startPolling = useCallback(
    (pipelineId: string) => {
      stopPolling();
      startedAtRef.current = Date.now();

      const tick = async () => {
        try {
          const status = await fetchStatus(pipelineId);
          setState((s) => ({ ...s, status, error: null }));
          if (status.status === 'complete' || status.status === 'failed') {
            stopPolling();
            setState((s) => ({ ...s, loading: false }));
            return;
          }
          if (Date.now() - startedAtRef.current > POLL_LIMIT_MS) {
            stopPolling();
            setState((s) => ({
              ...s,
              loading: false,
              error: 'Pipeline timed out after 5 minutes',
            }));
          }
        } catch (e) {
          stopPolling();
          setState((s) => ({
            ...s,
            loading: false,
            error: e instanceof Error ? e.message : 'Polling failed',
          }));
        }
      };

      void tick();
      pollRef.current = setInterval(() => void tick(), POLL_MS);
    },
    [fetchStatus, stopPolling]
  );

  const run = useCallback(
    async (businessId: string) => {
      setState({ pipelineId: null, status: null, loading: true, error: null });
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
        setState((s) => ({ ...s, pipelineId }));
        startPolling(pipelineId);
      } catch (e) {
        setState({
          pipelineId: null,
          status: null,
          loading: false,
          error: e instanceof Error ? e.message : 'Failed to start pipeline',
        });
      }
    },
    [startPolling]
  );

  const cancel = useCallback(() => {
    stopPolling();
    setState((s) => ({ ...s, loading: false }));
  }, [stopPolling]);

  return { ...state, run, cancel };
}
