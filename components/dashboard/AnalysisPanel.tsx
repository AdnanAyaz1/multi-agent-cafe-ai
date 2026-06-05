'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AgentTimeline } from './AgentTimeline';
import { RecommendationView } from './RecommendationView';
import { useEnqueueAnalysis } from '@/hooks/useEnqueueAnalysis';
import { useAnalysisStatus } from '@/hooks/useAnalysisStatus';
import {
  DEFAULT_BUSINESS_ID,
  TERMINAL_PIPELINE_STATUSES,
} from '@/constants/analysis';

const PIPELINE_PANEL_DESCRIPTION =
  'Runs the 5-agent pipeline (Menu → Weather → Strategist → Critic → Synthesizer) ' +
  'against the latest weather snapshot and the cafe’s menu.';

export default function AnalysisPanel() {
  const [businessId, setBusinessId] = useState(DEFAULT_BUSINESS_ID);
  const [pipelineId, setPipelineId] = useState<string | null>(null);

  const enqueue = useEnqueueAnalysis();
  const status = useAnalysisStatus(pipelineId);

  const isPollingActive = pipelineId !== null;
  const isRunning =
    enqueue.loading ||
    (status.data !== null &&
      !TERMINAL_PIPELINE_STATUSES.has(status.data.status));
  const error = enqueue.error ?? status.error;

  const handleRun = async () => {
    const result = await enqueue.run(businessId);
    if (result) setPipelineId(result.pipelineId);
  };

  const handleCancel = () => {
    status.stop();
  };

  const canRun = !isRunning && businessId.trim().length > 0;

  return (
    <section className="mx-auto mt-8 max-w-3xl space-y-6 p-6">
      <header>
        <h2 className="text-2xl font-bold">Daily AI Briefing</h2>
        <p className="text-sm text-gray-600">{PIPELINE_PANEL_DESCRIPTION}</p>
      </header>

      <div className="flex gap-2">
        <Input
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
          placeholder="Business ID"
          disabled={isRunning}
          onKeyDown={(e) => e.key === 'Enter' && canRun && handleRun()}
        />
        <Button onClick={handleRun} disabled={!canRun}>
          {isRunning ? 'Running...' : 'Run Analysis'}
        </Button>
        {isPollingActive && !status.stopped && (
          <Button variant="outline" onClick={handleCancel}>
            Stop polling
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="text-destructive">{error}</CardContent>
        </Card>
      )}

      {pipelineId && status.data && (
        <p className="text-xs text-gray-500">
          Pipeline: <code>{pipelineId}</code> &middot; status:{' '}
          {status.data.status}
        </p>
      )}

      {status.data && <AgentTimeline runs={status.data.agentRuns} />}

      {status.data?.recommendation && (
        <RecommendationView recommendation={status.data.recommendation} />
      )}
    </section>
  );
}
