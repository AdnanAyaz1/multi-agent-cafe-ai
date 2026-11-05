'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useDecisions } from '@/hooks/useDecisions';
import { usePipelineRateLimit } from '@/hooks/use-pipeline-rate-limit';
import { analysisFormSchema, type AnalysisFormInput } from '@/lib/validators/analysis';
import { isRateLimitError } from '@/lib/rate-limit-utils';
import type { Decision } from '@/types/decisions';
import type { WeatherData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AgentShowcase } from '@/components/dashboard/home/AgentShowcase';
import { PipelineVisualization } from '@/components/dashboard/home/PipelineVisualization';
import { DecisionDetailsModal } from '@/components/dashboard/decisions/DecisionDetailsModal';
import { AnalysisHeader } from '@/components/dashboard/analysis/AnalysisHeader';
import { AnalysisSearchForm } from '@/components/dashboard/analysis/AnalysisSearchForm';
import { RecommendationSummary } from '@/components/dashboard/analysis/RecommendationSummary';
import { RecommendationActions } from '@/components/dashboard/analysis/RecommendationActions';
import { RateLimitBanner } from '@/components/dashboard/RateLimitBanner';
import { MapPin } from 'lucide-react';

const WeatherPipelinePage = () => {
  const searchParams = useSearchParams();
  const queryCity = searchParams.get('city');

  const { status, loading, error, run, cancel, reset } = useAnalysis();
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [businessProfile, setBusinessProfile] = useState<{ id: string; name: string; city: string; cities: string[] } | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>(queryCity || '');
  const [weatherPreview, setWeatherPreview] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  const form = useForm<AnalysisFormInput>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: { businessId: '', city: queryCity || '' },
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.business?.id) {
          form.setValue('businessId', data.business.id);
          const rawCities = (data.business.cities as string[]) || [];
          const primaryCity = data.business.city || rawCities[0] || '';
          setBusinessProfile({
            id: data.business.id,
            name: data.business.name,
            city: data.business.city,
            cities: rawCities,
          });

          // If no city pre-selected via query param, default to primary branch city
          if (!queryCity && primaryCity) {
            setSelectedCity(primaryCity);
            form.setValue('city', primaryCity);
          }
        }
      })
      .catch(() => {});
  }, [form, queryCity]);

  // Fetch weather preview whenever selected city changes
  useEffect(() => {
    if (!selectedCity) return;
    let active = true;
    setWeatherLoading(true);

    fetch('/api/weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: selectedCity }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (active && data.data) {
          setWeatherPreview(data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setWeatherLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCity]);

  const handleSelectCity = useCallback(
    (city: string) => {
      setSelectedCity(city);
      form.setValue('city', city);
    },
    [form]
  );

  const businessId = form.watch('businessId');
  const { decisions, ingestRecommendation, approveDecision, rejectDecision } = useDecisions(businessId || undefined);

  const isRunning = status?.status === 'running' || status?.status === 'cancelling';
  const recommendation = status?.recommendation;

  const { hasRateLimitError, failedRunError, isRetrying, handleRetry, resetRetry, reset: resetRateLimit } = usePipelineRateLimit(
    status?.agentRuns ?? []
  );

  const handleRun = form.handleSubmit((data) => {
    resetRetry();
    run(data.businessId, 'weather', selectedCity || data.city || undefined);
  });

  const onRetry = useCallback(async () => {
    const currentBusinessId = form.getValues('businessId');
    await handleRetry(
      currentBusinessId,
      'weather',
      (bId, pType, c) => run(bId, pType, c),
      selectedCity || undefined
    );
  }, [form, handleRetry, run, selectedCity]);

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
      toast.loading(`Weather pipeline started for ${selectedCity || 'target city'} — agents are working...`, { id: 'pipeline' });
    } else if (current === 'cancelling' && prev !== 'cancelling') {
      toast.loading('Stopping pipeline — waiting for agents to finish...', { id: 'pipeline' });
    } else if (current === 'complete') {
      toast.success(`Weather pipeline complete for ${selectedCity || 'target city'} — recommendation ready!`, { id: 'pipeline' });
      resetRetry();
    } else if (current === 'cancelled') {
      toast.error('Pipeline cancelled by user.', { id: 'pipeline' });
      resetRetry();
    } else if (current === 'failed') {
      const failedRun = status.agentRuns.find((r) => r.status === 'failed' && r.error);
      const error_msg = failedRun?.error ?? 'Weather pipeline failed — please try again.';

      if (isRateLimitError(error_msg)) {
        toast.error('Rate limit reached. You can retry in a moment.', { id: 'pipeline' });
      } else {
        toast.error(error_msg, { id: 'pipeline' });
      }
    }
  }, [status?.status, status?.agentRuns, selectedCity, resetRetry]);

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
      <AnalysisHeader pipelineType="weather" />

      {businessProfile && (
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#e07850] tracking-wider font-bold">
                Weather Intelligence Target
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-zinc-400">
                Primary Branch: {businessProfile.city}
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-1">
              {businessProfile.name}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Operating in: {businessProfile.cities.join(', ') || businessProfile.city}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {businessProfile.cities.map((c) => {
              const isSelected = selectedCity.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelectCity(c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#e07850] text-[#1a1208] font-bold shadow-md shadow-[#e07850]/20'
                      : 'bg-white/[0.03] border border-white/[0.06] text-zinc-300 hover:bg-white/[0.07]'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-current" />
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <AnalysisSearchForm
        form={form}
        isRunning={isRunning}
        loading={loading}
        error={error}
        onSubmit={handleRun}
        onCancel={cancel}
        cities={businessProfile?.cities || []}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        weatherPreview={weatherPreview}
        weatherLoading={weatherLoading}
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
};

export default function WeatherPipelinePageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading Weather Pipeline...</div>}>
      <WeatherPipelinePage />
    </Suspense>
  );
}
