'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionList } from './ActionList';
import type { PipelineRecommendation } from '@/lib/api/analysis';

interface RecommendationViewProps {
  recommendation: PipelineRecommendation;
}

export function RecommendationView({ recommendation }: RecommendationViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{recommendation.summary}</CardTitle>
        <Badge variant="secondary">{recommendation.confidence}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="whitespace-pre-wrap break-words rounded bg-gray-50 p-3 font-sans text-sm leading-relaxed">
          {recommendation.reasoning}
        </pre>
        <div>
          <h4 className="mb-2 text-sm font-semibold">
            Actions ({recommendation.actions.length})
          </h4>
          <ActionList actions={recommendation.actions} />
        </div>
      </CardContent>
    </Card>
  );
}
