'use client';

import { Target } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { PipelineRecommendation } from '@/hooks/useAnalysis';
import { ConfidenceBadge } from '../ConfidenceBadge';
import { RecommendationActionList } from './RecommendationActionList';

export interface RecommendationViewProps {
  recommendation: NonNullable<PipelineRecommendation>;
}

export function RecommendationView({ recommendation }: RecommendationViewProps) {
  return (
    <div className="space-y-3">
      <Separator />
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">Recommendation</h3>
        <ConfidenceBadge level={recommendation.confidence} />
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="p-4">
          <h4 className="text-base font-semibold tracking-tight text-balance">
            {recommendation.summary}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">
            {recommendation.reasoning}
          </p>
        </div>
        <div className="border-t border-border bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Target className="size-3.5" aria-hidden />
            Actions ({recommendation.actions.length})
          </div>
          <RecommendationActionList actions={recommendation.actions} />
        </div>
      </div>
    </div>
  );
}
