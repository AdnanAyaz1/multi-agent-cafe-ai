'use client';

import { CheckCircle2, Loader2, AlertCircle, Clock, ChevronRight, Ban, AlertTriangle } from 'lucide-react';
import { AGENT_DISPLAY_ORDER, AGENT_CONFIG } from '@/constants/agents';
import { AGENT_COLORS, AGENT_BG } from '@/constants/agent-config';
import type { PipelineVisualizationProps } from '@/types/dashboard-home';
import { groupRunsByAgent, computeAgentStepStatus } from '@/lib/pipeline-utils';
import { isRateLimitError, getRateLimitMessage } from '@/lib/rate-limit-utils';
import { cn } from '@/lib/utils';

export const PipelineVisualization = ({ runs, isRunning }: PipelineVisualizationProps) => {
  const { byAgent, completedCount, progress } = groupRunsByAgent(runs);
  const isCancelled = runs.some((r) =>
    r.error === 'Pipeline cancelled by user' || r.error?.startsWith('Pipeline cancelled:') || r.error?.startsWith('Pipeline aborted:')
  ) && !isRunning;

  // Check for rate limit errors
  const failedRun = runs.find((r) => r.status === 'failed' && r.error);
  const hasRateLimitError = failedRun?.error ? isRateLimitError(failedRun.error) : false;
  const isFailed = runs.some((r) => r.status === 'failed') && !isCancelled;

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg border',
                isCancelled && 'border-amber-500/20 bg-amber-500/10',
                hasRateLimitError && 'border-amber-500/20 bg-amber-500/10',
                isFailed && !hasRateLimitError && 'border-red-500/20 bg-red-500/10',
                isRunning && 'border-[#e07850]/20 bg-[#e07850]/10',
                !isCancelled && !hasRateLimitError && !isFailed && !isRunning && 'border-green-500/20 bg-green-500/10'
              )}
            >
              {isCancelled ? (
                <Ban className="h-5 w-5 text-amber-400" />
              ) : hasRateLimitError ? (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              ) : isFailed ? (
                <AlertCircle className="h-5 w-5 text-red-400" />
              ) : isRunning ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#e07850]" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {isCancelled
                  ? 'Pipeline Cancelled'
                  : hasRateLimitError
                    ? 'Rate Limit Hit'
                    : isFailed
                      ? 'Pipeline Failed'
                      : isRunning
                        ? 'Pipeline Running'
                        : 'Pipeline Complete'}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400">
                {isCancelled
                  ? 'Stopped by user'
                  : hasRateLimitError
                    ? getRateLimitMessage(failedRun?.error ?? '').description
                    : isFailed
                      ? 'An agent encountered an error'
                      : `${completedCount}/${AGENT_DISPLAY_ORDER.length} agents done`}
              </p>
            </div>
          </div>

          {isRunning && (
            <div className="flex items-center gap-1.5 rounded-full border border-[#e07850]/20 bg-[#e07850]/10 px-3 py-1.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e07850]" />
              <span className="text-[10px] font-semibold text-[#e07850]">LIVE</span>
            </div>
          )}
          {isCancelled && (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5">
              <Ban className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] font-semibold text-amber-400">STOPPED</span>
            </div>
          )}
          {hasRateLimitError && !isRunning && (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] font-semibold text-amber-400">RATE LIMITED</span>
            </div>
          )}
          {isFailed && !hasRateLimitError && !isRunning && (
            <div className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5">
              <AlertCircle className="h-3 w-3 text-red-400" />
              <span className="text-[10px] font-semibold text-red-400">FAILED</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isCancelled && 'bg-amber-500',
                hasRateLimitError && 'bg-amber-500',
                isFailed && !hasRateLimitError && 'bg-red-500',
                !isCancelled && !hasRateLimitError && !isFailed && 'bg-[#e07850]'
              )}
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
                  <div className="absolute left-[19px] top-12 h-[calc(100%-16px)] w-px bg-zinc-800" />
                )}

                <div
                  className={cn(
                    'flex items-center gap-4 rounded-lg border p-4 transition-colors duration-150',
                    status === 'active' && 'border-zinc-700 bg-zinc-800/50',
                    status === 'complete' && 'border-zinc-800/50 bg-zinc-900/50',
                    status !== 'active' && status !== 'complete' && 'border-transparent'
                  )}
                >
                  {/* Step indicator */}
                  <div className="relative flex-shrink-0">
                    {status === 'complete' && (
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg border', AGENT_BG[role])}>
                        <CheckCircle2 className={cn('h-5 w-5', color)} />
                      </div>
                    )}
                    {status === 'active' && (
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg border', AGENT_BG[role])}>
                        <Loader2 className={cn('h-5 w-5 animate-spin', color)} />
                      </div>
                    )}
                    {status === 'failed' && (
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg border',
                          hasRateLimitError
                            ? 'border-amber-500/20 bg-amber-500/10'
                            : 'border-red-500/20 bg-red-500/10'
                        )}
                      >
                        {hasRateLimitError ? (
                          <AlertTriangle className="h-5 w-5 text-amber-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                    )}
                    {status === 'pending' && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                        <Clock className="h-5 w-5 text-zinc-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm font-semibold', hasRun ? 'text-white' : 'text-zinc-500')}>
                        {config.name}
                      </p>
                      {status === 'active' && (
                        <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-semibold', color, AGENT_BG[role])}>
                          RUNNING
                        </span>
                      )}
                      {status === 'complete' && (
                        <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[9px] font-semibold text-green-500">
                          DONE
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400">{config.description}</p>

                    {/* Stats */}
                    {hasRun && (
                      <div className="mt-2 flex items-center gap-3">
                        {totalTokens > 0 && (
                          <span className="font-mono text-[10px] text-zinc-500">{totalTokens.toLocaleString()} tokens</span>
                        )}
                        {totalDuration > 0 && (
                          <span className="font-mono text-[10px] text-zinc-500">{totalDuration}ms</span>
                        )}
                        {agentRuns[0]?.error &&
                          !agentRuns[0].error.startsWith('Pipeline cancelled') &&
                          !agentRuns[0].error.startsWith('Pipeline aborted') && (
                            <span className="text-[10px] text-red-400">{agentRuns[0].error}</span>
                          )}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className={cn('h-4 w-4 flex-shrink-0', hasRun ? 'text-zinc-400' : 'text-zinc-700')} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
