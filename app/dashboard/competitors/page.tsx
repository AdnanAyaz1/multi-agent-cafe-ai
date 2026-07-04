'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Globe, Loader2 } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useDecisions } from '@/hooks/useDecisions';
import { analysisFormSchema, type AnalysisFormInput } from '@/lib/validators/analysis';
import type { Decision } from '@/types/decisions';
import { AgentShowcase } from '@/components/dashboard/home/AgentShowcase';
import { PipelineVisualization } from '@/components/dashboard/home/PipelineVisualization';
import { DecisionDetailsModal } from '@/components/dashboard/decisions/DecisionDetailsModal';
import { AnalysisHeader } from '@/components/dashboard/analysis/AnalysisHeader';
import { AnalysisSearchForm } from '@/components/dashboard/analysis/AnalysisSearchForm';
import { RecommendationSummary } from '@/components/dashboard/analysis/RecommendationSummary';
import { RecommendationActions } from '@/components/dashboard/analysis/RecommendationActions';

export default function CompetitorPipelinePage() {
  const { status, loading, error, run, cancel } = useAnalysis();
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  const form = useForm<AnalysisFormInput>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: { businessId: '' },
  });

  const businessId = form.watch('businessId');
  const { decisions, ingestRecommendation, approveDecision, rejectDecision } = useDecisions(businessId || undefined);

  const isRunning = status?.status === 'running' || status?.status === 'cancelling';
  const recommendation = status?.recommendation;

  const handleRun = form.handleSubmit((data) => {
    run(data.businessId, 'competitor');
  });

  useEffect(() => {
    if (!status?.status) return;
    const prev = prevStatusRef.current;
    const current = status.status;
    if (prev === current) return;
    prevStatusRef.current = current;

    if (current === 'running' && prev !== 'running') {
      toast.loading('Competitor pipeline started — agents are working...', { id: 'pipeline' });
    } else if (current === 'cancelling' && prev !== 'cancelling') {
      toast.loading('Stopping pipeline — waiting for agents to finish...', { id: 'pipeline' });
    } else if (current === 'complete') {
      toast.success('Competitor pipeline complete — recommendation ready!', { id: 'pipeline' });
    } else if (current === 'cancelled') {
      toast.error('Pipeline cancelled by user.', { id: 'pipeline' });
    } else if (current === 'failed') {
      const failedRun = status.agentRuns.find((r) => r.status === 'failed' && r.error);
      const msg = failedRun?.error ?? 'Competitor pipeline failed — please try again.';
      toast.error(msg, { id: 'pipeline' });
    }
  }, [status?.status]);

  useEffect(() => {
    if (!status) prevStatusRef.current = null;
  }, [status]);

  const prevErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      prevErrorRef.current = error;
      toast.error(error, { id: 'pipeline-error' });
    }
    if (!error) prevErrorRef.current = null;
  }, [error]);

  const handleApprove = useCallback(async (decisionId: string) => {
    await approveDecision(decisionId);
  }, [approveDecision]);

  const handleReject = useCallback(async (decisionId: string) => {
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

  return (
    <div className="space-y-8">
      <AnalysisHeader pipelineType="competitor" />

      <AnalysisSearchForm
        form={form}
        isRunning={isRunning}
        loading={loading}
        error={error}
        onSubmit={handleRun}
        onCancel={cancel}
      />

      <AnimatePresence mode="wait">
        {status ? (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="space-y-8">
            {/* Pipeline visualization (shows agent runs when available) */}
            {status.agentRuns.length > 0 && (
              <PipelineVisualization runs={status.agentRuns} isRunning={isRunning} />
            )}

            {/* Progress indicator while scraping (before agent runs start) */}
            {isRunning && status.agentRuns.length === 0 && (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#e07850]/10 border border-[#e07850]/20 flex items-center justify-center">
                    {isRunning ? (
                      <Loader2 className="w-4 h-4 text-[#e07850] animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4 text-[#e07850]" />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Collecting competitor data...</p>
                    <p className="text-zinc-400 text-xs">Scraping websites and analyzing pricing</p>
                  </div>
                </div>
              </div>
            )}

            {recommendation && (
              <>
                <RecommendationSummary recommendation={recommendation} />
                <RecommendationActions
                  recommendation={recommendation}
                  getDecisionForAction={getDecisionForAction}
                  onSelectDecision={setSelectedDecision}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </>
            )}
          </motion.div>
        ) : (
          <AgentShowcase key="showcase" />
        )}
      </AnimatePresence>

      <DecisionDetailsModal
        decision={selectedDecision}
        onClose={() => setSelectedDecision(null)}
        onApprove={(id) => handleApprove(id)}
        onReject={(id) => handleReject(id)}
      />
    </div>
  );
}
