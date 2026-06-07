'use client';

import { useState } from 'react';
import {
  ChevronRight,
  Clock,
  Loader2,
  Play,
  Sparkles,
  Square,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { useAnalysis, type PipelineAgentRun } from '@/hooks/useAnalysis';
import { AGENT_DISPLAY, AGENT_DISPLAY_ORDER, type AgentRole } from '@/constants/agents';
import { DEFAULT_BUSINESS_ID } from '@/constants/pipeline';
import { AGENT_ICONS } from './agent-icons';
import { ConfidenceBadge } from './ConfidenceBadge';
import { PipelineStatusBadge } from './PipelineStatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type RunStatus = PipelineAgentRun['status'];

export default function AnalysisPanel() {
  const [businessId, setBusinessId] = useState(DEFAULT_BUSINESS_ID);
  const { pipelineId, status, loading, error, run, cancel } = useAnalysis();

  const onRun = () => {
    const trimmed = businessId.trim();
    if (trimmed) run(trimmed);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="size-4" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-[0.18em]">
            Agent Pipeline
          </span>
        </div>
        <CardTitle className="text-lg">Daily AI briefing</CardTitle>
        <CardDescription>
          Runs the 5-agent pipeline (Menu &rarr; Weather &rarr; Strategist &rarr;
          Critic &rarr; Synthesizer) against the latest weather snapshot and the
          cafe&apos;s menu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            onRun();
          }}
        >
          <Input
            value={businessId}
            onChange={(e) => setBusinessId(e.target.value)}
            placeholder="Business ID"
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !businessId.trim()}
            className="cursor-pointer gap-1.5"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Play className="size-4" aria-hidden />
            )}
            {loading ? 'Running' : 'Run Analysis'}
          </Button>
          {loading && (
            <Button
              type="button"
              variant="outline"
              onClick={cancel}
              className="cursor-pointer gap-1.5"
            >
              <Square className="size-3.5" aria-hidden />
              Stop
            </Button>
          )}
        </form>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {pipelineId && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono">
              {pipelineId}
            </Badge>
            <span>
              status:{' '}
              <span className="text-foreground">
                {status?.status ?? 'pending'}
              </span>
            </span>
          </div>
        )}

        {status && <AgentTimeline runs={status.agentRuns} />}

        {status?.recommendation && (
          <RecommendationView recommendation={status.recommendation} />
        )}
      </CardContent>
    </Card>
  );
}

interface AgentTimelineMeta {
  label: string;
  description: string;
  Icon: LucideIcon;
}

function buildAgentTimelineMeta(): Record<AgentRole, AgentTimelineMeta> {
  const meta = {} as Record<AgentRole, AgentTimelineMeta>;
  for (const role of AGENT_DISPLAY_ORDER) {
    meta[role] = {
      label: AGENT_DISPLAY[role].label,
      description: AGENT_DISPLAY[role].description,
      Icon: AGENT_ICONS[role],
    };
  }
  return meta;
}

const AGENT_TIMELINE_META = buildAgentTimelineMeta();

function AgentTimeline({ runs }: { runs: PipelineAgentRun[] }) {
  const byAgent = new Map<string, PipelineAgentRun[]>();
  for (const run of runs) {
    const list = byAgent.get(run.agentName) ?? [];
    list.push(run);
    byAgent.set(run.agentName, list);
  }

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
                  <div className="flex size-9 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-muted-foreground">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  {!isLast && (
                    <div
                      className="my-1 w-px flex-1 bg-border"
                      aria-hidden
                      style={{ minHeight: 16 }}
                    />
                  )}
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
                <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Icon className="size-4" aria-hidden />
                </div>
                {!isLast && (
                  <div
                    className="my-1 w-px flex-1 bg-border"
                    aria-hidden
                    style={{ minHeight: 16 }}
                  />
                )}
              </div>
              <div className="flex-1 space-y-2">
                {agentRuns.map((r, idx) => (
                  <div
                    key={r.id}
                    className={cn(
                      'rounded-2xl border border-border/60 bg-card/60 px-3 py-2.5 text-sm transition-colors',
                      r.status === 'running' && 'border-info/40 bg-info/5'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {meta.label}
                        {agentRuns.length > 1 ? ` (round ${idx + 1})` : ''}
                      </span>
                      <PipelineStatusBadge status={r.status as RunStatus} />
                    </div>
                    {(r.durationMs != null || r.tokenCount != null) && (
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        {r.durationMs != null && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" aria-hidden />
                            {r.durationMs}ms
                          </span>
                        )}
                        {r.tokenCount != null && (
                          <span className="font-mono">
                            {r.tokenCount.toLocaleString()} tokens
                          </span>
                        )}
                      </div>
                    )}
                    {r.error && (
                      <div className="mt-1 text-xs text-destructive">
                        {r.error}
                      </div>
                    )}
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

function RecommendationView({
  recommendation,
}: {
  recommendation: NonNullable<ReturnType<typeof useAnalysis>['status']>['recommendation'];
}) {
  if (!recommendation) return null;
  return (
    <div className="space-y-3">
      <Separator />
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">Recommendation</h3>
        <ConfidenceBadge level={recommendation.confidence} />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-card to-info/5">
        <div className="p-4">
          <h4 className="text-base font-semibold tracking-tight text-balance">
            {recommendation.summary}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">
            {recommendation.reasoning}
          </p>
        </div>
        <div className="border-t border-border/60 bg-card/60 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Target className="size-3.5" aria-hidden />
            Actions ({recommendation.actions.length})
          </div>
          <ul className="space-y-1.5">
            {recommendation.actions.map((a) => {
              const details = a.details as
                | { reason?: string; priority?: number; discountPercent?: number }
                | null;
              return (
                <li
                  key={a.id}
                  className="group flex items-start gap-2 rounded-xl border border-border/60 bg-background/60 p-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                    <ChevronRight className="size-3.5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm">
                        <span className="font-semibold uppercase tracking-wide">
                          {a.actionType}
                        </span>
                        <span className="text-muted-foreground"> &mdash; </span>
                        <span className="font-medium">{a.item}</span>
                        {details?.discountPercent ? (
                          <span className="ml-1 text-success">
                            (-{details.discountPercent}%)
                          </span>
                        ) : null}
                      </span>
                      {details?.priority != null && (
                        <Badge variant="outline" className="font-mono">
                          p{details.priority}
                        </Badge>
                      )}
                    </div>
                    {details?.reason && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {details.reason}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
