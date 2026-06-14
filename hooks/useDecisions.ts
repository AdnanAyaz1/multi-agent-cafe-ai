'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Decision, DecisionAction, DecisionLog } from '@/types/decisions';
import { logger } from '@/lib/logger';

const log = logger.child('useDecisions');

interface PaginatedResponse {
  decisions: Decision[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useDecisions(businessId?: string) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [pending, setPending] = useState<Decision[]>([]);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchDecisions = useCallback(async (p: number, status?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: '20' });
      if (businessId) params.set('businessId', businessId);
      if (status) params.set('status', status);

      const res = await fetch(`/api/decisions?${params}`);
      if (!res.ok) throw new Error('Failed to fetch decisions');
      const data: PaginatedResponse = await res.json();
      return data;
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const setPage = useCallback(async (p: number) => {
    setPageState(p);
    const data = await fetchDecisions(p);
    if (data) {
      setDecisions(data.decisions);
      setPageState(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    }
  }, [fetchDecisions]);

  const loadPending = useCallback(async () => {
    const data = await fetchDecisions(1, 'pending');
    if (data) {
      setPending(data.decisions);
    }
  }, [fetchDecisions]);

  useEffect(() => {
    setPage(1);
    loadPending();
  }, [setPage, loadPending]);

  const ingestRecommendation = useCallback(async (rec: {
    id: string;
    summary: string;
    confidence: string;
    actions: DecisionAction[];
    businessId: string;
  }) => {
    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: rec.businessId,
          recommendationId: rec.id,
          summary: rec.summary,
          confidence: rec.confidence,
          actions: rec.actions.map((a) => ({
            ...a,
            details: typeof a.details === 'string' ? JSON.parse(a.details) : a.details,
          })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        log.error('Failed to ingest decisions', undefined, { status: res.status, ...err });
        toast.error('Failed to save recommendations');
        return;
      }
      setPage(page);
      loadPending();
      toast.success('Recommendations saved');
    } catch (e) {
      log.error('ingestRecommendation failed', e);
      toast.error('Failed to save recommendations');
    }
  }, [setPage, loadPending, page]);

  const approveDecision = useCallback(async (decisionId: string, reason?: string) => {
    try {
      await fetch(`/api/decisions/${decisionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', reason }),
      });
      setPage(page);
      loadPending();
      toast.success('Decision approved');
    } catch {
      setPending((prev) => prev.filter((d) => d.id !== decisionId));
      toast.error('Failed to approve decision');
    }
  }, [setPage, loadPending, page]);

  const rejectDecision = useCallback(async (decisionId: string, reason?: string) => {
    try {
      await fetch(`/api/decisions/${decisionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', reason }),
      });
      setPage(page);
      loadPending();
      toast.success('Decision rejected');
    } catch {
      setPending((prev) => prev.filter((d) => d.id !== decisionId));
      toast.error('Failed to reject decision');
    }
  }, [setPage, loadPending, page]);

  const bulkApprove = useCallback(async (decisionIds: string[]) => {
    try {
      await Promise.all(
        decisionIds.map((id) =>
          fetch(`/api/decisions/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'approved' }),
          })
        )
      );
      setPage(page);
      loadPending();
      toast.success(`${decisionIds.length} decisions approved`);
    } catch {
      toast.error('Failed to approve some decisions');
    }
  }, [setPage, loadPending, page]);

  const logs: DecisionLog[] = decisions
    .filter((d) => d.status !== 'pending')
    .map((d) => {
      const details = d.details as { discountPercent?: number; priority?: number; reason?: string } | null;
      return {
        id: `${d.id}-log`,
        decisionId: d.id,
        action: d.actionType,
        item: d.item,
        discountPercent: details?.discountPercent,
        priority: details?.priority,
        status: d.status as DecisionLog['status'],
        decidedAt: d.decidedAt ?? d.createdAt,
        reason: d.reason ?? details?.reason,
        confidence: d.confidence,
        summary: d.summary,
      };
    });

  return {
    decisions,
    pending,
    logs,
    loading,
    page,
    totalPages,
    total,
    setPage,
    ingestRecommendation,
    approveDecision,
    rejectDecision,
    bulkApprove,
    refresh: () => { setPage(page); loadPending(); },
  };
}
