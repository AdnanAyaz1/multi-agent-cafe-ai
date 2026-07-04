'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { COMPETITOR_POLL_INTERVAL_MS, COMPETITOR_POLL_TIMEOUT_MS } from '@/constants/competitor';
import type { RefreshOptions, CompetitorSnapshot } from '@/types/analysis';

export type { RefreshOptions };
export type Snapshot = CompetitorSnapshot;

export function useCompetitorSnapshots(businessId: string) {
  const [businessName, setBusinessName] = useState<string>('');
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [polling, setPolling] = useState(false);
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

  const loadSnapshots = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/competitor/${businessId}`);
      if (!res.ok) throw new Error('Failed to fetch snapshots');
      const data = await res.json();
      setSnapshots(data.snapshots ?? []);
      setBusinessName(data.businessName ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  const refresh = useCallback(async (options?: RefreshOptions) => {
    try {
      setRefreshing(true);
      setError(null);
      stopPolling();

      const oldSnapshotCount = snapshots.length;

      await fetch('/api/competitor/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, ...options }),
      });

      setPolling(true);
      toast.loading('Scrape job started — waiting for results...', { id: 'scrape' });

      const startTime = Date.now();
      const interval = setInterval(async () => {
        // Timeout: stop polling after COMPETITOR_POLL_TIMEOUT_MS
        if (Date.now() - startTime > COMPETITOR_POLL_TIMEOUT_MS) {
          clearInterval(interval);
          intervalRef.current = null;
          setPolling(false);
          setRefreshing(false);
          toast.error('Scrape timed out — try again or check worker status.', { id: 'scrape' });
          return;
        }

        try {
          const res = await fetch(`/api/competitor/${businessId}`);
          const data = await res.json();
          setSnapshots(data.snapshots ?? []);

          if (data.snapshots.length > oldSnapshotCount) {
            clearInterval(interval);
            intervalRef.current = null;
            setPolling(false);
            setRefreshing(false);
            toast.success('New competitor data available!', { id: 'scrape' });
          }
        } catch {
          clearInterval(interval);
          intervalRef.current = null;
          setPolling(false);
          setRefreshing(false);
          toast.error('Failed to fetch updated snapshots', { id: 'scrape' });
        }
      }, COMPETITOR_POLL_INTERVAL_MS);

      intervalRef.current = interval;
    } catch (err) {
      setRefreshing(false);
      setPolling(false);
      setError(err instanceof Error ? err.message : 'Refresh failed');
      toast.error('Failed to start scrape job');
    }
  }, [businessId, snapshots.length, stopPolling]);

  return {
    businessId,
    businessName,
    snapshots,
    loading,
    refreshing,
    polling,
    error,
    refresh,
    reload: loadSnapshots,
  };
}
