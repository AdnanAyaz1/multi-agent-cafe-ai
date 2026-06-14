'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Loader2, Lightbulb, ListChecks, Sparkles, ArrowRight, Zap, CheckCircle2, XCircle, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalysis } from '@/hooks/useAnalysis';
import { useDecisions } from '@/hooks/useDecisions';
import { AgentShowcase } from '@/components/dashboard/home/AgentShowcase';
import { PipelineVisualization } from '@/components/dashboard/home/PipelineVisualization';
import { RecommendationMarkdown } from '@/components/dashboard/analysis/RecommendationMarkdown';
import { DecisionDetailsModal } from '@/components/dashboard/decisions/DecisionDetailsModal';
import type { Decision } from '@/types/decisions';

export default function AnalysisPage() {
  const [businessId, setBusinessId] = useState('');
  const { status, loading, error, run, cancel } = useAnalysis();
  const { decisions, ingestRecommendation, approveDecision, rejectDecision } = useDecisions(businessId || undefined);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  const handleRun = () => {
    if (businessId.trim()) run(businessId.trim());
  };

  const isRunning = status?.status === 'running';
  const recommendation = status?.recommendation;

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
    } else if (current === 'cancelled') {
      toast.info('Pipeline cancelled.', { id: 'pipeline' });
    }
  }, [status?.status]);

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

  const getDecisionForAction = (actionId: string) =>
    decisions.find((d) => d.actionId === actionId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-[#e89070]" />
          <p className="text-[11px] text-[#e89070] uppercase tracking-[0.2em] font-semibold font-mono">Agent Pipeline</p>
        </div>
        <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
          Watch AI think
        </h1>
        <p className="text-zinc-400 text-sm lg:text-base max-w-lg">
          Five specialized agents chained together — analyzing weather, competitors, and your menu to maximize revenue.
        </p>
      </div>

      {/* Search form */}
      <div className="glass-card rounded-2xl p-1.5 max-w-2xl">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isRunning && handleRun()}
              placeholder="Enter business ID (e.g. cafe-001)"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#e89070]/30 focus:ring-1 focus:ring-[#e89070]/20 transition-all duration-150"
            />
          </div>
          {isRunning ? (
            <button onClick={cancel} className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/30 transition-all duration-150 flex items-center gap-2">
              Stop Pipeline
            </button>
          ) : (
            <button onClick={handleRun} disabled={loading || !businessId.trim()} className="px-6 py-3 rounded-xl bg-[#e07850] text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-50 transition-all duration-150 flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Run Pipeline
            </button>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pb-2 text-sm text-red-400">
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {status ? (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="space-y-8">
            <PipelineVisualization runs={status.agentRuns} isRunning={isRunning} />

            {recommendation && (
              <>
                {/* Recommendation summary */}
                <div className="glass-card rounded-3xl overflow-hidden">
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="p-6 lg:p-8 bg-zinc-900 border-b border-zinc-800">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <Lightbulb className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-white text-lg font-bold">Strategic Recommendation</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">AI-optimized for maximum revenue</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20 font-mono">
                          {recommendation.actions[0]?.actionType ?? 'Recommendation'}
                        </span>
                        <span className="text-sm font-bold text-amber-500">{recommendation.confidence} confidence</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 lg:p-8">
                      <p className="text-zinc-400 text-sm leading-relaxed mb-6">{recommendation.summary}</p>

                      {recommendation.reasoning && (
                        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 mb-6">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-3 font-mono">Full Briefing</p>
                          <RecommendationMarkdown content={recommendation.reasoning} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions with decision buttons */}
                {recommendation.actions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ListChecks className="w-4 h-4 text-amber-500" />
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-mono">Recommended Actions</p>
                      <span className="text-[9px] text-zinc-500 font-mono">· Review & decide</span>
                    </div>

                    {recommendation.actions.map((action, i) => {
                      const decision = getDecisionForAction(action.id);
                      const dp = action.details?.discountPercent;
                      const status = decision?.status;
                      const isAuto = status === 'auto-approved';
                      const isPending = status === 'pending';
                      const isDecided = status === 'approved' || status === 'rejected';

                      return (
                        <div
                          key={action.id}
                          className={`glass-card rounded-2xl p-4 transition-all duration-150 ${isPending ? 'border-amber-500/20' : ''
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Number / status icon */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isAuto ? 'bg-green-500/10 border border-green-500/20' :
                                isPending ? 'bg-amber-500/10 border border-amber-500/20' :
                                  status === 'approved' ? 'bg-green-500/10 border border-green-500/20' :
                                    status === 'rejected' ? 'bg-red-500/10 border border-red-500/20' :
                                      'bg-zinc-900 border border-zinc-800'
                              }`}>
                              {isAuto ? <Zap className="w-4 h-4 text-green-500" /> :
                                status === 'approved' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                  status === 'rejected' ? <XCircle className="w-4 h-4 text-red-400" /> :
                                    <span className="text-[9px] font-bold text-amber-500 font-mono">{i + 1}</span>}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-white text-sm font-semibold truncate">{action.item}</p>
                                {dp != null && dp > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e07850]/10 border border-[#e07850]/20">
                                    <TrendingDown className="w-2.5 h-2.5 text-[#e07850]" />
                                    <span className="text-[9px] text-[#e07850] font-bold font-mono">-{dp}%</span>
                                  </span>
                                )}
                              </div>
                              {action.details?.reason && (
                                <p className="text-zinc-400 text-xs truncate mt-0.5">{action.details.reason}</p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => setSelectedDecision(decision ?? null)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-semibold hover:bg-zinc-800 hover:text-white transition-all duration-150 font-mono"
                              >
                                Details
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              {isPending && decision && (
                                <>
                                  <button
                                    onClick={() => handleReject(decision.id, action.item)}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-all duration-150 font-mono"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleApprove(decision.id, action.item)}
                                    className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold hover:bg-green-500/20 transition-all duration-150 font-mono"
                                  >
                                    Approve
                                  </button>
                                </>
                              )}

                              {isAuto && (
                                <span className="flex items-center gap-1 px-2 py-1 text-[9px] text-green-500 font-bold font-mono">
                                  <Zap className="w-3 h-3" /> Auto
                                </span>
                              )}

                              {isDecided && (
                                <span className={`text-[9px] font-bold px-2 py-1 ${status === 'approved' ? 'text-green-500' : 'text-red-400'} font-mono`}>
                                  {status === 'approved' ? 'Approved' : 'Rejected'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <AgentShowcase key="showcase" />
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <DecisionDetailsModal
        decision={selectedDecision}
        onClose={() => setSelectedDecision(null)}
        onApprove={(id) => handleApprove(id, selectedDecision?.item ?? 'action')}
        onReject={(id) => handleReject(id, selectedDecision?.item ?? 'action')}
      />
    </div>
  );
}
