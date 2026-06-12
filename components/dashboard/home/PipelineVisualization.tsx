'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import type { PipelineAgentRun } from '@/hooks/useAnalysis';
import { AGENT_DISPLAY_ORDER, AGENT_CONFIG } from '@/constants/agents';

const AGENT_COLORS: Record<string, string> = {
  'menu-analyst': '#00d2ff',
  'weather-analyst': '#1fe19e',
  strategist: '#ffd79f',
  critic: '#f87171',
  synthesizer: '#a78bfa',
};

interface PipelineVisualizationProps {
  runs: PipelineAgentRun[];
  isRunning: boolean;
}

export function PipelineVisualization({ runs, isRunning }: PipelineVisualizationProps) {
  const byAgent = new Map<string, PipelineAgentRun[]>();
  for (const run of runs) {
    const list = byAgent.get(run.agentName) ?? [];
    list.push(run);
    byAgent.set(run.agentName, list);
  }

  const completedCount = AGENT_DISPLAY_ORDER.filter((role) => {
    const agentRuns = byAgent.get(role) ?? [];
    return agentRuns.length > 0 && agentRuns.every((r) => r.status === 'complete');
  }).length;

  const progress = (completedCount / AGENT_DISPLAY_ORDER.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-3xl overflow-hidden group relative"
    >
      {/* Glow */}
      <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[#a78bfa]/10" />

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a78bfa] to-[#818cf8] flex items-center justify-center shadow-lg shadow-[#a78bfa]/20">
              {isRunning ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 className="w-5 h-5 text-white" />
                </motion.div>
              ) : (
                <CheckCircle2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Pipeline {isRunning ? 'Running' : 'Complete'}
              </p>
              <p className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                {completedCount}/{AGENT_DISPLAY_ORDER.length} agents done
              </p>
            </div>
          </div>

          {isRunning && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#a78bfa]/10 border border-[#a78bfa]/20">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[10px] text-[#a78bfa] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                LIVE
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#a78bfa] via-[#00d2ff] to-[#1fe19e]"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Agent steps */}
        <div className="space-y-2">
          {AGENT_DISPLAY_ORDER.map((role, i) => {
            const agentRuns = byAgent.get(role) ?? [];
            const config = AGENT_CONFIG[role];
            const color = AGENT_COLORS[role];
            const isComplete = agentRuns.length > 0 && agentRuns.every((r) => r.status === 'complete');
            const isAgentRunning = agentRuns.some((r) => r.status === 'running');
            const isFailed = agentRuns.some((r) => r.status === 'failed');
            const hasRun = agentRuns.length > 0;

            // First pending agent should show as "active" when pipeline is running
            const isFirstPending = isRunning && !hasRun && !AGENT_DISPLAY_ORDER.slice(0, i).some((prevRole) => {
              const prevRuns = byAgent.get(prevRole) ?? [];
              return prevRuns.length === 0 || prevRuns.some((r) => r.status === 'running' || r.status === 'pending');
            }) && AGENT_DISPLAY_ORDER.slice(0, i).every((prevRole) => {
              const prevRuns = byAgent.get(prevRole) ?? [];
              return prevRuns.length > 0 && prevRuns.every((r) => r.status === 'complete');
            });

            const status = isComplete ? 'complete' : isAgentRunning || isFirstPending ? 'active' : isFailed ? 'failed' : 'pending';

            const totalTokens = agentRuns.reduce((sum, r) => sum + (r.tokenCount ?? 0), 0);
            const totalDuration = agentRuns.reduce((sum, r) => sum + (r.durationMs ?? 0), 0);

            return (
              <motion.div
                key={role}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                className="relative"
              >
                {/* Connector */}
                {i < AGENT_DISPLAY_ORDER.length - 1 && (
                  <div
                    className="absolute left-[19px] top-12 w-px h-[calc(100%-16px)]"
                    style={{
                      background: isComplete
                        ? `linear-gradient(to bottom, ${color}40, ${AGENT_COLORS[AGENT_DISPLAY_ORDER[i + 1]]}20)`
                        : 'rgba(255,255,255,0.04)',
                    }}
                  />
                )}

                <div
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    status === 'active'
                      ? 'bg-white/[0.04] border border-white/[0.08]'
                      : status === 'complete'
                        ? 'bg-white/[0.02] border border-white/[0.04]'
                        : 'border border-transparent'
                  }`}
                >
                  {/* Step indicator */}
                  <div className="relative flex-shrink-0">
                    {status === 'complete' && (
                      <motion.div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, delay: 0.5 + i * 0.1 }}
                      >
                        <CheckCircle2 className="w-5 h-5" style={{ color }} />
                      </motion.div>
                    )}
                    {status === 'active' && (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                          <Loader2 className="w-5 h-5" style={{ color }} />
                        </motion.div>
                      </div>
                    )}
                    {status === 'failed' && (
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      </div>
                    )}
                    {status === 'pending' && (
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#859399]/30" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-bold ${hasRun ? 'text-white' : 'text-[#859399]/50'}`}
                        style={{ fontFamily: 'var(--font-montserrat)' }}
                      >
                        {config.name}
                      </p>
                      {status === 'active' && (
                        <motion.span
                          className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ fontFamily: 'var(--font-jetbrains-mono)', color, background: `${color}15`, border: `1px solid ${color}20` }}
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          RUNNING
                        </motion.span>
                      )}
                      {status === 'complete' && (
                        <span
                          className="text-[9px] px-2 py-0.5 rounded-full font-semibold text-[#1fe19e] bg-[#1fe19e]/10 border border-[#1fe19e]/15"
                          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                        >
                          DONE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#859399] mt-0.5">{config.description}</p>

                    {/* Stats */}
                    {hasRun && (
                      <div className="flex items-center gap-3 mt-2">
                        {totalTokens > 0 && (
                          <span className="text-[9px] text-[#859399] font-mono">{totalTokens.toLocaleString()} tokens</span>
                        )}
                        {totalDuration > 0 && (
                          <span className="text-[9px] text-[#859399] font-mono">{totalDuration}ms</span>
                        )}
                        {agentRuns[0]?.error && (
                          <span className="text-[9px] text-red-400">{agentRuns[0].error}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${hasRun ? 'text-[#859399]' : 'text-[#859399]/20'}`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
