'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PipelineAgentRun {
  id: string;
  agentName: string;
  status: string;
  durationMs?: number;
  tokenCount?: number;
  error?: string;
}

export interface PipelineRecommendation {
  id: string;
  summary: string;
  reasoning: string;
  confidence: string;
  actions: Array<{
    id: string;
    actionType: string;
    item: string;
    details?: {
      reason?: string;
      priority?: number;
      discountPercent?: number;
    };
  }>;
}

export interface PipelineStatus {
  status: string;
  agentRuns: PipelineAgentRun[];
  recommendation?: PipelineRecommendation;
}

export function useAnalysis() {
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const run = useCallback(async (businessId: string) => {
    try {
      setLoading(true);
      setError(null);
      stopPolling();

      const res = await fetch('/api/analysis/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });

      if (!res.ok) throw new Error('Failed to start analysis');

      const data = await res.json();
      setPipelineId(data.pipelineId);

      setStatus({
        status: 'running',
        agentRuns: [],
      });

      if (data.status === 'complete') {
        const statusRes = await fetch(`/api/analysis/${data.pipelineId}`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setStatus({
            status: statusData.status,
            agentRuns: statusData.agentRuns ?? [],
            recommendation: statusData.recommendation ?? undefined,
          });
          setLoading(false);
        }
        return;
      }

      let pollCount = 0;
      const maxPolls = 30;

      const interval = setInterval(async () => {
        pollCount++;
        try {
          const statusRes = await fetch(`/api/analysis/${data.pipelineId}`);
          if (statusRes.status === 404) {
            if (pollCount >= maxPolls) {
              clearInterval(interval);
              intervalRef.current = null;
              setLoading(false);
              setError('Pipeline did not start. The analysis worker may not be available.');
            }
            return;
          }
          if (!statusRes.ok) {
            clearInterval(interval);
            intervalRef.current = null;
            setLoading(false);
            setError(`Pipeline status check failed (${statusRes.status})`);
            return;
          }
          const statusData = await statusRes.json();
          setStatus({
            status: statusData.status,
            agentRuns: statusData.agentRuns ?? [],
            recommendation: statusData.recommendation ?? undefined,
          });
          if (statusData.status === 'complete' || statusData.status === 'failed') {
            clearInterval(interval);
            intervalRef.current = null;
            setLoading(false);
          }
        } catch {
          clearInterval(interval);
          intervalRef.current = null;
          setLoading(false);
        }
      }, 2000);

      intervalRef.current = interval;
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    }
  }, [stopPolling]);

  const cancel = useCallback(() => {
    stopPolling();
    setLoading(false);
    setStatus((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
  }, [stopPolling]);

  return {
    pipelineId,
    status,
    loading,
    error,
    run,
    cancel,
  };
}
