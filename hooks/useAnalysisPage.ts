'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useDecisions } from '@/hooks/useDecisions';
import { analysisFormSchema, type AnalysisFormInput } from '@/lib/validators/analysis';
import type { Decision } from '@/types/decisions';


export function useAnalysisPage() {
  const { status, loading, error, run, cancel } = useAnalysis();
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  const form = useForm<AnalysisFormInput>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: { businessId: '' },
  });

  const businessId = form.watch('businessId');
  const { decisions, ingestRecommendation, approveDecision, rejectDecision } = useDecisions(businessId || undefined);

  const isRunning = status?.status === 'running';
  const recommendation = status?.recommendation;

  const handleRun = form.handleSubmit((data) => {
    run(data.businessId);
  });

  useEffect(() => {
    if (!status?.status) return;
    const prev = prevStatusRef.current;
    const current = status.status;
    if (prev === current) return;
    prevStatusRef.current = current;

    if (current === 'running' && prev !== 'running') {
      toast.loading('Pipeline started — agents are working...', { id: 'pipeline' });
    } else if (current === 'complete') {
      toast.success('Pipeline complete — recommendation ready!', { id: 'pipeline' });
    } else if (current === 'failed') {
      toast.error('Pipeline failed — please try again.', { id: 'pipeline' });
    }
  }, [status?.status]);

  // Reset prevStatusRef when status is cleared (cancel)
  useEffect(() => {
    if (!status) {
      prevStatusRef.current = null;
    }
  }, [status]);

  const prevErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      prevErrorRef.current = error;
      toast.error(error, { id: 'pipeline-error' });
    }
    if (!error) prevErrorRef.current = null;
  }, [error]);

  const handleApprove = useCallback(async (decisionId: string, _actionItem?: string) => {
    await approveDecision(decisionId);
  }, [approveDecision]);

  const handleReject = useCallback(async (decisionId: string, _actionItem?: string) => {
    await rejectDecision(decisionId);
  }, [rejectDecision]);

  const ingestedRef = useRef<string | null>(null);
  useEffect(() => {
    if (recommendation?.id && recommendation.id !== ingestedRef.current) {
      ingestedRef.current = recommendation.id;
      ingestRecommendation({
        id: recommendation.id,
        summary: recommendation.summary,
        confidence: recommendation.confidence,
        actions: recommendation.actions,
        businessId: businessId.trim(),
      });
    }
  }, [recommendation, ingestRecommendation, businessId]);

  const getDecisionForAction = useCallback(
    (actionId: string) => decisions.find((d) => d.actionId === actionId),
    [decisions]
  );

  return {
    form,
    isRunning,
    loading,
    error,
    status,
    cancel,
    recommendation,
    decisions,
    selectedDecision,
    setSelectedDecision,
    handleRun,
    handleApprove,
    handleReject,
    getDecisionForAction,
  };
}
