'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/dashboard/ui/PageHeader';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { AnalysisStats } from '@/components/dashboard/home/AnalysisStats';
import { RunAnalysisCard } from '@/components/dashboard/home/RunAnalysisCard';
import { PipelineTimeline } from '@/components/dashboard/home/PipelineTimeline';
import { AnalysisRecommendation } from '@/components/dashboard/home/AnalysisRecommendation';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function AnalysisPage() {
  const [businessId, setBusinessId] = useState('');
  const { pipelineId, status, loading, error, run, cancel } = useAnalysis();

  const handleRun = () => {
    if (businessId.trim()) {
      run(businessId.trim());
    }
  };

  return (
    <div>
      <PageHeader
        title="Agent Pipeline"
        subtitle="Watch the AI agent chain of thought optimize your menu strategy."
      />

      {status ? (
        <>
          <AnalysisStats status={status} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <RunAnalysisCard
                businessId={businessId}
                onBusinessIdChange={setBusinessId}
                onRun={handleRun}
                onCancel={cancel}
                loading={loading}
                running={status.status === 'running'}
                error={error}
              />
              {status.recommendation && (
                <AnalysisRecommendation recommendation={status.recommendation} />
              )}
            </div>
            <div className="lg:col-span-8">
              <PipelineTimeline runs={status.agentRuns} />
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <RunAnalysisCard
              businessId={businessId}
              onBusinessIdChange={setBusinessId}
              onRun={handleRun}
              onCancel={cancel}
              loading={loading}
              running={false}
              error={error}
            />
          </div>
          <div className="lg:col-span-8">
            <EmptyState
              icon="🤖"
              title="No Analysis Running"
              description="Enter a business ID and run an analysis to see the AI agent pipeline in action."
            />
          </div>
        </div>
      )}
    </div>
  );
}
