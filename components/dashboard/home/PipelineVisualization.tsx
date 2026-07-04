'use client';

import { CheckCircle2, Loader2, AlertCircle, Clock, ChevronRight, Ban } from 'lucide-react';
import { AGENT_DISPLAY_ORDER, AGENT_CONFIG } from '@/constants/agents';
import { AGENT_COLORS, AGENT_BG } from '@/constants/agent-config';
import type { PipelineVisualizationProps } from '@/types/dashboard-home';
import { groupRunsByAgent, computeAgentStepStatus } from '@/lib/pipeline-utils';

export function PipelineVisualization({ runs, isRunning }: PipelineVisualizationProps) {
  const { byAgent, completedCount, progress } = groupRunsByAgent(runs);
  const isCancelled = runs.some((r) =>
    r.error === 'Pipeline cancelled by user' || r.error?.startsWith('Pipeline cancelled:') || r.error?.startsWith('Pipeline aborted:')
  ) && !isRunning;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
              isCancelled
                ? 'bg-amber-500/10 border-amber-500/20'
                : isRunning
                  ? 'bg-[#e07850]/10 border-[#e07850]/20'
                  : 'bg-green-500/10 border-green-500/20'
            }`}>
              {isCancelled ? (
                <Ban className="w-5 h-5 text-amber-400" />
              ) : isRunning ? (
                <Loader2 className="w-5 h-5 text-[#e07850] animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">
                Pipeline {isCancelled ? 'Cancelled' : isRunning ? 'Running' : 'Complete'}
              </p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                {isCancelled ? 'Stopped by user' : `${completedCount}/${AGENT_DISPLAY_ORDER.length} agents done`}
              </p>
            </div>
          </div>

          {isRunning && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e07850]/10 border border-[#e07850]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e07850] animate-pulse" />
              <span className="text-[10px] text-[#e07850] font-semibold">LIVE</span>
            </div>
          )}
          {isCancelled && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Ban className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] text-amber-400 font-semibold">STOPPED</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCancelled ? 'bg-amber-500' : 'bg-[#e07850]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Agent steps */}
        <div className="space-y-2">
          {AGENT_DISPLAY_ORDER.map((role, i) => {
            const agentRuns = byAgent.get(role) ?? [];
            const config = AGENT_CONFIG[role];
            const color = AGENT_COLORS[role];
            const status = computeAgentStepStatus(role, byAgent, isRunning, i);
            const hasRun = agentRuns.length > 0;

            const totalTokens = agentRuns.reduce((sum, r) => sum + (r.tokenCount ?? 0), 0);
            const totalDuration = agentRuns.reduce((sum, r) => sum + (r.durationMs ?? 0), 0);

            return (
              <div key={role} className="relative">
                {/* Connector */}
                {i < AGENT_DISPLAY_ORDER.length - 1 && (
                  <div
                    className="absolute left-[19px] top-12 w-px h-[calc(100%-16px)] bg-zinc-800"
                  />
                )}

                <div
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors duration-150 ${
                    status === 'active'
                      ? 'bg-zinc-800/50 border border-zinc-700'
                      : status === 'complete'
                        ? 'bg-zinc-900/50 border border-zinc-800/50'
                        : 'border border-transparent'
                  }`}
                >
                  {/* Step indicator */}
                  <div className="relative flex-shrink-0">
                    {status === 'complete' && (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${AGENT_BG[role]}`}>
                        <CheckCircle2 className={`w-5 h-5 ${color}`} />
                      </div>
                    )}
                    {status === 'active' && (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${AGENT_BG[role]}`}>
                        <Loader2 className={`w-5 h-5 ${color} animate-spin`} />
                      </div>
                    )}
                    {status === 'failed' && (
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      </div>
                    )}
                    {status === 'pending' && (
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${hasRun ? 'text-white' : 'text-zinc-500'}`}>
                        {config.name}
                      </p>
                      {status === 'active' && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${color} ${AGENT_BG[role]}`}>
                          RUNNING
                        </span>
                      )}
                      {status === 'complete' && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold text-green-500 bg-green-500/10 border border-green-500/20">
                          DONE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{config.description}</p>

                    {/* Stats */}
                    {hasRun && (
                      <div className="flex items-center gap-3 mt-2">
                        {totalTokens > 0 && (
                          <span className="text-[10px] text-zinc-500 font-mono">{totalTokens.toLocaleString()} tokens</span>
                        )}
                        {totalDuration > 0 && (
                          <span className="text-[10px] text-zinc-500 font-mono">{totalDuration}ms</span>
                        )}
                        {agentRuns[0]?.error && !agentRuns[0].error.startsWith('Pipeline cancelled') && !agentRuns[0].error.startsWith('Pipeline aborted') && (
                          <span className="text-[10px] text-red-400">{agentRuns[0].error}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ${hasRun ? 'text-zinc-400' : 'text-zinc-700'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
