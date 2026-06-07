'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CompetitorData } from '@/lib/types';
import { COMPETITOR_POLL_INTERVAL_MS, COMPETITOR_POLL_TIMEOUT_MS } from '@/constants/competitor';

export interface CompetitorSnapshot {
  id: string;
  collectedAt: string;
  expiresAt: string;
  data: CompetitorData;
}

export interface CompetitorEnqueueResult {
  jobId: string | undefined;
  url: string;
}

export interface CompetitorRefreshResponse {
  pipelineId: string;
  businessId: string;
  enqueued: CompetitorEnqueueResult[];
  message: string;
}

export interface CompetitorListResponse {
  businessId: string;
  businessName: string;
  count: number;
  snapshots: CompetitorSnapshot[];
}

export interface RefreshOptions {
  url?: string;
  timeoutMs?: number;
  maxTextLength?: number;
}

export interface UseCompetitorSnapshotsResult {
  businessId: string | null;
  businessName: string | null;
  snapshots: CompetitorSnapshot[];
  loading: boolean;
  refreshing: boolean;
  polling: boolean;
  error: string | null;
  refresh: (options?: RefreshOptions) => Promise<void>;
  reload: () => Promise<void>;
}

export function useCompetitorSnapshots(
  initialBusinessId: string | null
): UseCompetitorSnapshotsResult {
  const [businessId, setBusinessId] = useState<string | null>(initialBusinessId);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<CompetitorSnapshot[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(initialBusinessId));
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [polling, setPolling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingStartedAtRef = useRef<number>(0);
  const initialBaselineRef = useRef<Set<string>>(new Set());

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setPolling(false);
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const fetchSnapshots = useCallback(
    async (id: string): Promise<CompetitorListResponse> => {
      const res = await fetch(`/api/competitor/${encodeURIComponent(id)}`);

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `snapshot fetch failed (${res.status})`);
      }

      return (await res.json()) as CompetitorListResponse;
    },
    []
  );

  const loadSnapshots = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchSnapshots(id);
        setBusinessName(data.businessName);
        setSnapshots(data.snapshots);
        initialBaselineRef.current = new Set(data.snapshots.map((s) => s.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load snapshots');
      } finally {
        setLoading(false);
      }
    },
    [fetchSnapshots]
  );

  const reload = useCallback(async () => {
    if (!businessId) {
      setSnapshots([]);
      setBusinessName(null);
      return;
    }
    await loadSnapshots(businessId);
  }, [businessId, loadSnapshots]);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    void (async () => {
      const data = await fetchSnapshots(businessId).catch((err): null => {
        if (cancelled) return null;
        setError(err instanceof Error ? err.message : 'Failed to load snapshots');
        setLoading(false);
        return null;
      });
      if (cancelled || !data) return;
      setBusinessName(data.businessName);
      setSnapshots(data.snapshots);
      initialBaselineRef.current = new Set(data.snapshots.map((s) => s.id));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [businessId, fetchSnapshots]);

  const startPolling = useCallback(
    (id: string, baselineIds: Set<string>) => {
      stopPolling();
      pollingStartedAtRef.current = Date.now();
      setPolling(true);

      const pollOnce = async () => {
        if (Date.now() - pollingStartedAtRef.current > COMPETITOR_POLL_TIMEOUT_MS) {
          stopPolling();
          setRefreshing(false);
          setError('Scrape timed out after 2 minutes');
          return;
        }

        try {
          const data = await fetchSnapshots(id);
          setBusinessName(data.businessName);
          setSnapshots(data.snapshots);

          const hasNew = data.snapshots.some((s) => !baselineIds.has(s.id));
          if (hasNew) {
            stopPolling();
            setRefreshing(false);
            return;
          }
        } catch (err) {
          stopPolling();
          setRefreshing(false);
          setError(err instanceof Error ? err.message : 'Polling failed');
        }
      };

      void pollOnce();

      pollingIntervalRef.current = setInterval(
        () => void pollOnce(),
        COMPETITOR_POLL_INTERVAL_MS
      );
    },
    [fetchSnapshots, stopPolling]
  );

  const refresh = useCallback(
    async (options: RefreshOptions = {}) => {
      if (!businessId) {
        setError('businessId is required to refresh');
        return;
      }

      stopPolling();
      setRefreshing(true);
      setError(null);

      const baselineIds = new Set(snapshots.map((s) => s.id));

      try {
        const res = await fetch('/api/competitor/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId,
            ...(options.url ? { url: options.url } : {}),
            ...(options.timeoutMs ? { timeoutMs: options.timeoutMs } : {}),
            ...(options.maxTextLength ? { maxTextLength: options.maxTextLength } : {}),
          }),
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `enqueue failed (${res.status})`);
        }

        const result = (await res.json()) as CompetitorRefreshResponse;
        if (result.businessId && result.businessId !== businessId) {
          setBusinessId(result.businessId);
        }

        startPolling(result.businessId, baselineIds);
      } catch (err) {
        setRefreshing(false);
        setError(err instanceof Error ? err.message : 'Failed to enqueue scrape');
      }
    },
    [businessId, snapshots, startPolling, stopPolling]
  );

  return {
    businessId,
    businessName,
    snapshots,
    loading,
    refreshing,
    polling,
    error,
    refresh,
    reload,
  };
}
