'use client';

import { useState, useMemo, useCallback } from 'react';
import { useDecisions } from '@/hooks/useDecisions';
import { DEFAULT_BUSINESS_ID } from '@/constants/pipeline';
import type { Decision } from '@/types/decisions';

export function useDecisionsPage() {
  const { pending, decisions, logs, loading, page, totalPages, total, setPage, approveDecision, rejectDecision, bulkApprove } = useDecisions(DEFAULT_BUSINESS_ID);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');

  const handleApprove = useCallback(async (decisionId: string) => {
    await approveDecision(decisionId);
  }, [approveDecision]);

  const handleReject = useCallback(async (decisionId: string) => {
    await rejectDecision(decisionId);
  }, [rejectDecision]);

  const handleBulkApprove = useCallback(async () => {
    await bulkApprove(pending.map((d) => d.id));
  }, [bulkApprove, pending]);

  const historyLogs = useMemo(() =>
    logs.filter((l) => l.status !== 'pending'),
    [logs]
  );

  return {
    pending,
    decisions,
    logs,
    loading,
    page,
    totalPages,
    total,
    setPage,
    selectedDecision,
    setSelectedDecision,
    tab,
    setTab,
    handleApprove,
    handleReject,
    handleBulkApprove,
    historyLogs,
  };
}
