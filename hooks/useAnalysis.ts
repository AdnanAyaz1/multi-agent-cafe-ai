'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PipelineType, PipelineAgentRun, PipelineRecommendation } from '@/types/analysis';

export type { PipelineType, PipelineAgentRun, PipelineRecommendation };

export interface PipelineStatus {
  status: string;
  pipelineType?: PipelineType;
  agentRuns: PipelineAgentRun[];
  recommendation?: PipelineRecommendation;
}

export function useAnalysis() {
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activePipelineRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const run = useCallback(async (businessId: string, pipelineType: PipelineType = 'weather') => {
    try {
      setLoading(true);
      setError(null);
      stopPolling();

      const res = await fetch('/api/analysis/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, pipelineType }),
      });

      if (!res.ok) throw new Error('Failed to start analysis');

      const data = await res.json();
      setPipelineId(data.pipelineId);
      activePipelineRef.current = data.pipelineId;

      setStatus({
        status: 'running',
        pipelineType: data.pipelineType,
        agentRuns: [],
      });

      if (data.status === 'complete') {
        const statusRes = await fetch(`/api/analysis/${data.pipelineId}`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setStatus({
            status: statusData.status,
            pipelineType: data.pipelineType,
            agentRuns: statusData.agentRuns ?? [],
            recommendation: statusData.recommendation ?? undefined,
          });
          setLoading(false);
        }
        return;
      }

      let pollCount = 0;
      const maxPolls = 30;
      let retriesAfterComplete = 0;
      const maxRetriesAfterComplete = 5;
      const activePipelineId = data.pipelineId;

      const interval = setInterval(async () => {
        pollCount++;
        try {
          const statusRes = await fetch(`/api/analysis/${activePipelineId}`);
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

          // If pipeline was cancelled (ref cleared), stop this interval.
          if (activePipelineRef.current !== activePipelineId) {
            clearInterval(interval);
            intervalRef.current = null;
            return;
          }

          setStatus({
            status: statusData.status,
            pipelineType: data.pipelineType,
            agentRuns: statusData.agentRuns ?? [],
            recommendation: statusData.recommendation ?? undefined,
          });

          // Stop polling on terminal states
          if (statusData.status === 'complete' || statusData.status === 'failed' || statusData.status === 'cancelled') {
            // If complete but recommendation is missing, keep polling briefly
            // to handle the race window between synthesizer completion and
            // recommendation persistence.
            if (statusData.status === 'complete' && !statusData.recommendation && retriesAfterComplete < maxRetriesAfterComplete) {
              retriesAfterComplete++;
              return;
            }
            clearInterval(interval);
            intervalRef.current = null;
            setLoading(false);
          }
          // Note: 'cancelling' status keeps polling — we don't stop until
          // the backend confirms the pipeline has fully stopped.
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

  const cancel = useCallback(async () => {
    const currentPipelineId = activePipelineRef.current;

    // Set UI to "cancelling" state immediately so the user sees feedback
    if (currentPipelineId) {
      setStatus((prev) => prev ? { ...prev, status: 'cancelling' } : null);
    }

    // CRITICAL: Send the DELETE request FIRST, before clearing any state.
    // If we clear state first, React re-renders, the component may unmount,
    // and the browser aborts the fetch — the server never receives the cancel.
    if (currentPipelineId) {
      try {
        await fetch(`/api/analysis/${currentPipelineId}`, { method: 'DELETE' });
      } catch {
        // Best-effort: if the server call fails, the pipeline will check
        // the Redis cancellation flag on its next step.
      }
    }

    // Do NOT stop polling or clear state yet.
    // The polling loop will detect when the backend status changes to
    // 'cancelled' or 'failed' and will stop polling + clear loading at that point.
    //
    // This ensures the UI stays in sync with the actual backend state
    // instead of optimistically showing "stopped" while jobs are still running.
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setPipelineId(null);
    setStatus(null);
    setLoading(false);
    setError(null);
    activePipelineRef.current = null;
  }, [stopPolling]);

  return {
    pipelineId,
    status,
    loading,
    error,
    run,
    cancel,
    reset,
  };
}
