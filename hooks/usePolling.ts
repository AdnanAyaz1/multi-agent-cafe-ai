'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { POLL_TIMEOUT_MS } from '@/constants/analysis';

export interface UsePollingOptions {
  /** How often to re-run the fetcher, in ms. */
  intervalMs: number;
  /** If false, polling is paused. Default true. */
  enabled?: boolean;
  /** Stop polling when this returns true for the latest data. */
  shouldStop?: (data: unknown) => boolean;
  /** Hard cap on total polling time, in ms. Default from POLL_TIMEOUT_MS. */
  timeoutMs?: number;
  /** Run the fetcher once immediately on mount/enable. Default true. */
  runImmediately?: boolean;
}

export interface UsePollingResult<T> {
  data: T | null;
  error: string | null;
  /** True while a poll is in flight (NOT while waiting between polls). */
  loading: boolean;
  /** True once the polling has stopped (terminal status, timeout, or manual stop). */
  stopped: boolean;
  /** Manually stop polling. */
  stop: () => void;
  /** Re-arm polling (e.g. after a stop). */
  reset: () => void;
}

/**
 * Generic polling hook. Runs `fetcher` immediately, then every `intervalMs`,
 * until `shouldStop` returns true, the timeout elapses, or `stop()` is called.
 *
 * The hook does not know about your data shape — pass a fetcher and a
 * shouldStop predicate. Cleanup is automatic on unmount.
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  options: UsePollingOptions
): UsePollingResult<T> {
  const {
    intervalMs,
    enabled = true,
    shouldStop,
    timeoutMs = POLL_TIMEOUT_MS,
    runImmediately = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stopped, setStopped] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);
  const fetcherRef = useRef(fetcher);
  const shouldStopRef = useRef(shouldStop);

  // Keep refs in sync without re-running the polling effect when
  // the consumer passes fresh inline callbacks.
  useEffect(() => {
    fetcherRef.current = fetcher;
    shouldStopRef.current = shouldStop;
  });

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clear();
    setStopped(true);
  }, [clear]);

  const reset = useCallback(() => {
    clear();
    setError(null);
    setStopped(false);
    setData(null);
  }, [clear]);

  useEffect(() => {
    if (!enabled || stopped) return;

    clear();
    startedAtRef.current = Date.now();

    const tick = async () => {
      setLoading(true);
      try {
        const next = await fetcherRef.current();
        setData(next);
        setError(null);
        if (shouldStopRef.current?.(next)) {
          stop();
          return;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Polling failed');
        stop();
        return;
      } finally {
        setLoading(false);
      }

      if (Date.now() - startedAtRef.current > timeoutMs) {
        setError('Polling timed out');
        stop();
      }
    };

    if (runImmediately) void tick();
    intervalRef.current = setInterval(() => void tick(), intervalMs);

    return clear;
  }, [enabled, stopped, intervalMs, timeoutMs, runImmediately, clear, stop]);

  return { data, error, loading, stopped, stop, reset };
}
