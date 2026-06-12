'use client';

import { CheckCircle2, Loader2, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import type { PipelineAgentRun } from '@/hooks/useAnalysis';
import { AGENT_DISPLAY_ORDER, AGENT_CONFIG } from '@/constants/agents';

const AGENT_COLORS: Record<string, string> = {
  'menu-analyst': 'text-blue-500',
  'weather-analyst': 'text-green-500',
  strategist: 'text-amber-500',
  critic: 'text-red-400',
  synthesizer: 'text-purple-400',
};

const AGENT_BG: Record<string, string> = {
  'menu-analyst': 'bg-blue-500/10 border-blue-500/20',
  'weather-analyst': 'bg-green-500/10 border-green-500/20',
  strategist: 'bg-amber-500/10 border-amber-500/20',
  critic: 'bg-red-500/10 border-red-500/20',
  synthesizer: 'bg-purple-500/10 border-purple-500/20',
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
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              {isRunning ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">
                Pipeline {isRunning ? 'Running' : 'Complete'}
              </p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                {completedCount}/{AGENT_DISPLAY_ORDER.length} agents done
              </p>
            </div>
          </div>

          {isRunning && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] text-blue-500 font-semibold font-mono">LIVE</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
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
            const isComplete = agentRuns.length > 0 && agentRuns.every((r) => r.status === 'complete');
            const isAgentRunning = agentRuns.some((r) => r.status === 'running');
            const isFailed = agentRuns.some((r) => r.status === 'failed');
            const hasRun = agentRuns.length > 0;

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
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold font-mono ${color} ${AGENT_BG[role]}`}>
                          RUNNING
                        </span>
                      )}
                      {status === 'complete' && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold text-green-500 bg-green-500/10 border border-green-500/20 font-mono">
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
                        {agentRuns[0]?.error && (
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
