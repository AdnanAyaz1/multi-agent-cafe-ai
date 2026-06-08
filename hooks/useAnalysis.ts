'use client';

import { useEffect, useRef, useState } from 'react';

export interface PipelineAgentRun {
  id: string;
  agentName: string;
  status: string;
  durationMs?: number;
  tokenCount?: number;
  error?: string;
}

export interface PipelineRecommendation {
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

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const run = async (businessId: string) => {
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
      setPipelineId(data.id);
      setStatus(data);

      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/analysis/${data.id}`);
          const statusData = await statusRes.json();
          setStatus(statusData);

          if (statusData.status === 'complete' || statusData.status === 'failed') {
            clearInterval(interval);
            setLoading(false);
          }
        } catch {
          clearInterval(interval);
          setLoading(false);
        }
      }, 3000);

      intervalRef.current = interval;
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Analysis failed');
    }
  };

  const cancel = () => {
    stopPolling();
    setLoading(false);
    setStatus((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
  };

  return {
    pipelineId,
    status,
    loading,
    error,
    run,
    cancel,
  };
}
