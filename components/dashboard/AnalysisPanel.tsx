'use client';

import { useState } from 'react';
import { Loader2, Play, Sparkles, Square } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';
import { DEFAULT_BUSINESS_ID } from '@/constants/pipeline';
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
import { AgentTimeline } from './analysis/AgentTimeline';
import { RecommendationView } from './analysis/RecommendationView';

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
          {loading ? (
            <Button
              type="button"
              variant="outline"
              onClick={cancel}
              className="cursor-pointer gap-1.5"
            >
              <Square className="size-3.5" aria-hidden />
              Stop
            </Button>
          ) : null}
        </form>

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        {pipelineId ? (
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
        ) : null}

        {status ? <AgentTimeline runs={status.agentRuns} /> : null}

        {status?.recommendation ? (
          <RecommendationView recommendation={status.recommendation} />
        ) : null}
      </CardContent>
    </Card>
  );
}
