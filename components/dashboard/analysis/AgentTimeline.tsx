'use client';

import { Clock } from 'lucide-react';
import { AGENT_DISPLAY_ORDER } from '@/constants/agents';
import { type PipelineRunStatus } from '@/constants/pipeline';
import { PipelineStatusBadge } from '../PipelineStatusBadge';
import { AgentTimelineConnector } from './AgentTimelineConnector';
import { AGENT_TIMELINE_META } from './agent-timeline-meta';
import { cn } from '@/lib/utils';
import type { AgentTimelineProps } from '@/types/dashboard';
import { groupRunsByAgent } from '@/lib/pipeline-utils';

export function AgentTimeline({ runs }: AgentTimelineProps) {
  const { byAgent } = groupRunsByAgent(runs);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">Agent timeline</h3>
        <span className="text-xs text-muted-foreground">
          {runs.length} run{runs.length === 1 ? '' : 's'}
        </span>
      </div>
      <ol className="space-y-2">
        {AGENT_DISPLAY_ORDER.map((name, idx) => {
          const meta = AGENT_TIMELINE_META[name];
          const Icon = meta.Icon;
          const agentRuns = byAgent.get(name) ?? [];
          const isLast = idx === AGENT_DISPLAY_ORDER.length - 1;

          if (agentRuns.length === 0) {
            return (
              <li key={name} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  {!isLast ? <AgentTimelineConnector /> : null}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {meta.label}
                    </span>
                    <PipelineStatusBadge status="pending" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {meta.description} &mdash; waiting
                  </p>
                </div>
              </li>
            );
          }

          return (
            <li key={name} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden />
                </div>
                {!isLast ? <AgentTimelineConnector /> : null}
              </div>
              <div className="flex-1 space-y-2">
                {agentRuns.map((r, idx) => (
                  <div
                    key={r.id}
                    className={cn(
                      'rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors',
                      r.status === 'running' && 'border-info/40 bg-info/5'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {meta.label}
                        {agentRuns.length > 1 ? ` (round ${idx + 1})` : ''}
                      </span>
                      <PipelineStatusBadge status={r.status as PipelineRunStatus} />
                    </div>
                    {(r.durationMs != null || r.tokenCount != null) ? (
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        {r.durationMs != null ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" aria-hidden />
                            {r.durationMs}ms
                          </span>
                        ) : null}
                        {r.tokenCount != null ? (
                          <span className="font-mono">
                            {r.tokenCount.toLocaleString()} tokens
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    {r.error ? (
                      <div className="mt-1 text-xs text-destructive">
                        {r.error}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
