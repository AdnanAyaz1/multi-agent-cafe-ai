'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Globe, Loader2, RotateCcw } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useDecisions } from '@/hooks/useDecisions';
import { usePipelineRateLimit } from '@/hooks/use-pipeline-rate-limit';
import { analysisFormSchema, type AnalysisFormInput } from '@/lib/validators/analysis';
import { isRateLimitError } from '@/lib/rate-limit-utils';
import type { Decision } from '@/types/decisions';
import { Button } from '@/components/ui/button';
import { AgentShowcase } from '@/components/dashboard/home/AgentShowcase';
import { PipelineVisualization } from '@/components/dashboard/home/PipelineVisualization';
import { DecisionDetailsModal } from '@/components/dashboard/decisions/DecisionDetailsModal';
import { AnalysisHeader } from '@/components/dashboard/analysis/AnalysisHeader';
import { AnalysisSearchForm } from '@/components/dashboard/analysis/AnalysisSearchForm';
import { RecommendationSummary } from '@/components/dashboard/analysis/RecommendationSummary';
import { RecommendationActions } from '@/components/dashboard/analysis/RecommendationActions';
import { RateLimitBanner } from '@/components/dashboard/RateLimitBanner';
import { CafeOnboardingWizard } from '@/components/dashboard/onboarding/CafeOnboardingWizard';

const CompetitorPipelinePage = () => {
  const { status, loading, error, run, cancel, reset } = useAnalysis();
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [businessProfile, setBusinessProfile] = useState<{ id: string; name: string; competitorUrls: string[]; cities: string[] } | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  const form = useForm<AnalysisFormInput>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: { businessId: '' },
  });

  const fetchProfile = useCallback(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.business?.id) {
          form.setValue('businessId', data.business.id);
          setBusinessProfile({
            id: data.business.id,
            name: data.business.name,
            competitorUrls: data.business.competitorUrls || [],
            cities: data.business.cities || [],
          });
        }
      })
      .catch(() => {});
  }, [form]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const businessId = form.watch('businessId');
  const { decisions, ingestRecommendation, approveDecision, rejectDecision } = useDecisions(businessId || undefined);

  const isRunning = status?.status === 'running' || status?.status === 'cancelling';
  const recommendation = status?.recommendation;

  const { hasRateLimitError, failedRunError, isRetrying, handleRetry, resetRetry, reset: resetRateLimit } = usePipelineRateLimit(
    status?.agentRuns ?? []
  );

  const handleRun = form.handleSubmit((data) => {
    resetRetry();
    run(data.businessId, 'competitor');
  });

  const onRetry = useCallback(async () => {
    const currentBusinessId = form.getValues('businessId');
    await handleRetry(currentBusinessId, 'competitor', run);
  }, [form, handleRetry, run]);

  const handleReset = useCallback(() => {
    reset();
    resetRateLimit();
    setSelectedDecision(null);
  }, [reset, resetRateLimit]);

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
      resetRetry();
    } else if (current === 'cancelled') {
      toast.error('Pipeline cancelled by user.', { id: 'pipeline' });
      resetRetry();
    } else if (current === 'failed') {
      const failedRun = status.agentRuns.find((r) => r.status === 'failed' && r.error);
      const error_msg = failedRun?.error ?? 'Competitor pipeline failed — please try again.';

      if (isRateLimitError(error_msg)) {
        toast.error('Rate limit reached. You can retry in a moment.', { id: 'pipeline' });
      } else {
        toast.error(error_msg, { id: 'pipeline' });
      }
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

      {businessProfile && (
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#e07850] tracking-wider font-bold">
                Benchmarked Competitors
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400">
                {businessProfile.competitorUrls.length} Active Targets
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-1">
              {businessProfile.name}
            </p>
            <p className="text-xs text-zinc-400 truncate max-w-md mt-0.5">
              {businessProfile.competitorUrls.length > 0
                ? businessProfile.competitorUrls.join(', ')
                : 'No competitor URLs configured yet. Add competitor menus to enable scraping.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] text-xs font-semibold transition-all self-start sm:self-auto flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-[#e07850]" />
            Manage Competitor URLs
          </button>
        </div>
      )}

      <AnalysisSearchForm
        form={form}
        isRunning={isRunning}
        loading={loading}
        error={error}
        onSubmit={handleRun}
        onCancel={cancel}
      />

      {hasRateLimitError && failedRunError && !isRunning && (
        <RateLimitBanner error={failedRunError} onRetry={onRetry} isRetrying={isRetrying} />
      )}

      {status?.status === 'failed' && !hasRateLimitError && !isRunning && (
        <Button
          variant="outline"
          onClick={handleReset}
          className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 hover:text-white"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset and Try Again
        </Button>
      )}

      <AnimatePresence mode="wait">
        {status ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {status.agentRuns.length > 0 && (
              <PipelineVisualization runs={status.agentRuns} isRunning={isRunning} />
            )}

            {isRunning && status.agentRuns.length === 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e07850]/20 bg-[#e07850]/10">
                    {isRunning ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#e07850]" />
                    ) : (
                      <Globe className="h-4 w-4 text-[#e07850]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Collecting competitor data...</p>
                    <p className="text-xs text-zinc-400">Scraping websites and analyzing pricing</p>
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

      <CafeOnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialCities={businessProfile?.cities}
        initialCompetitors={businessProfile?.competitorUrls}
        businessId={businessProfile?.id}
        onComplete={fetchProfile}
      />
    </div>
  );
};

export default CompetitorPipelinePage;
