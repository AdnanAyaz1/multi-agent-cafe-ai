'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Lightbulb, ListChecks, Sparkles, ArrowRight, Zap, CheckCircle2, XCircle, TrendingDown } from 'lucide-react';
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

  const handleRun = () => {
    if (businessId.trim()) run(businessId.trim());
  };

  const isRunning = status?.status === 'running';
  const recommendation = status?.recommendation;

  // Ingest recommendation into decisions when it arrives
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div className="h-px w-12 bg-gradient-to-r from-[#a78bfa] to-transparent" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ transformOrigin: 'left' }} />
          <p className="text-[11px] text-[#a78bfa] uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Agent Pipeline</p>
        </div>
        <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>
          Watch AI <span className="gradient-text">think</span>
        </h1>
        <p className="text-[#859399] text-sm lg:text-base max-w-lg">
          Five specialized agents chained together — analyzing weather, competitors, and your menu to maximize revenue.
        </p>
      </motion.div>

      {/* Search form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card rounded-2xl p-1.5 max-w-2xl"
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#859399]" />
            <input
              type="text"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isRunning && handleRun()}
              placeholder="Enter business ID (e.g. cafe-001)"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-[#859399]/50 focus:outline-none focus:border-[#a78bfa]/30 focus:ring-1 focus:ring-[#a78bfa]/20 transition-all duration-300"
            />
          </div>
          {isRunning ? (
            <motion.button onClick={cancel} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2">
              Stop Pipeline
            </motion.button>
          ) : (
            <motion.button onClick={handleRun} disabled={loading || !businessId.trim()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#818cf8] text-white text-sm font-bold hover:shadow-lg hover:shadow-[#a78bfa]/20 disabled:opacity-50 transition-all duration-300 flex items-center gap-2">
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Loader2 className="w-4 h-4" /></motion.div>
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Run Pipeline
            </motion.button>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pb-2 text-sm text-red-400">
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence mode="wait">
        {status ? (
          <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="space-y-8">
            <PipelineVisualization runs={status.agentRuns} isRunning={isRunning} />

            {recommendation && (
              <>
                {/* Recommendation summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="glass-card rounded-3xl overflow-hidden group relative"
                >
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[#ffd79f]/10" />

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="p-6 lg:p-8 bg-gradient-to-br from-[#ffd79f]/[0.06] to-[#f59e0b]/[0.03] border-b border-white/[0.06]">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffd79f] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-[#ffd79f]/20">
                          <Lightbulb className="w-6 h-6 text-[#003543]" />
                        </div>
                        <div>
                          <p className="text-white text-lg font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>Strategic Recommendation</p>
                          <p className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>AI-optimized for maximum revenue</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1fe19e]/10 text-[#1fe19e] border border-[#1fe19e]/15" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                          {recommendation.actions[0]?.actionType ?? 'Recommendation'}
                        </span>
                        <span className="text-sm font-bold text-[#ffd79f]">{recommendation.confidence} confidence</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 lg:p-8">
                      <p className="text-[#859399] text-sm leading-relaxed mb-6">{recommendation.summary}</p>

                      {recommendation.reasoning && (
                        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] mb-6">
                          <p className="text-[10px] text-[#859399] uppercase tracking-wider font-semibold mb-3" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Full Briefing</p>
                          <RecommendationMarkdown content={recommendation.reasoning} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Actions with decision buttons */}
                {recommendation.actions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ListChecks className="w-4 h-4 text-[#ffd79f]" />
                      <p className="text-[10px] text-[#859399] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Recommended Actions</p>
                      <span className="text-[9px] text-[#859399]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>· Review & decide</span>
                    </div>

                    {recommendation.actions.map((action, i) => {
                      const decision = getDecisionForAction(action.id);
                      const dp = action.details?.discountPercent;
                      const status = decision?.status;
                      const isAuto = status === 'auto-approved';
                      const isPending = status === 'pending';
                      const isDecided = status === 'approved' || status === 'rejected';

                      return (
                        <motion.div
                          key={action.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.08 }}
                          className={`glass-card rounded-2xl p-4 transition-all duration-300 ${
                            isPending ? 'border-[#ffd79f]/10' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Number / status icon */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isAuto ? 'bg-[#1fe19e]/10 border border-[#1fe19e]/15' :
                              isPending ? 'bg-[#ffd79f]/10 border border-[#ffd79f]/15' :
                              status === 'approved' ? 'bg-[#1fe19e]/10 border border-[#1fe19e]/15' :
                              status === 'rejected' ? 'bg-red-500/10 border border-red-500/15' :
                              'bg-white/[0.03] border border-white/[0.06]'
                            }`}>
                              {isAuto ? <Zap className="w-4 h-4 text-[#1fe19e]" /> :
                               status === 'approved' ? <CheckCircle2 className="w-4 h-4 text-[#1fe19e]" /> :
                               status === 'rejected' ? <XCircle className="w-4 h-4 text-red-400" /> :
                               <span className="text-[9px] font-bold text-[#ffd79f]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{i + 1}</span>}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-white text-sm font-semibold truncate" style={{ fontFamily: 'var(--font-montserrat)' }}>{action.item}</p>
                                {dp != null && dp > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/15">
                                    <TrendingDown className="w-2.5 h-2.5 text-[#00d2ff]" />
                                    <span className="text-[9px] text-[#00d2ff] font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>-{dp}%</span>
                                  </span>
                                )}
                              </div>
                              {action.details?.reason && (
                                <p className="text-[#859399] text-xs truncate mt-0.5">{action.details.reason}</p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => setSelectedDecision(decision ?? null)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#859399] text-[10px] font-semibold hover:bg-white/[0.06] hover:text-white transition-all"
                                style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                              >
                                Details
                                <ArrowRight className="w-3 h-3" />
                              </button>

                              {isPending && decision && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => rejectDecision(decision.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/15 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-all"
                                    style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                                  >
                                    Reject
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => approveDecision(decision.id)}
                                    className="px-3 py-1.5 rounded-lg bg-[#1fe19e]/10 border border-[#1fe19e]/15 text-[#1fe19e] text-[10px] font-bold hover:bg-[#1fe19e]/20 transition-all"
                                    style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                                  >
                                    Approve
                                  </motion.button>
                                </>
                              )}

                              {isAuto && (
                                <span className="flex items-center gap-1 px-2 py-1 text-[9px] text-[#1fe19e] font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                                  <Zap className="w-3 h-3" /> Auto
                                </span>
                              )}

                              {isDecided && (
                                <span className={`text-[9px] font-bold px-2 py-1 ${status === 'approved' ? 'text-[#1fe19e]' : 'text-red-400'}`} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                                  {status === 'approved' ? 'Approved' : 'Rejected'}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
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
        onApprove={approveDecision}
        onReject={rejectDecision}
      />
    </div>
  );
}
