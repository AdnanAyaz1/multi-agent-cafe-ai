import { Lightbulb, ListChecks } from 'lucide-react';
import { Card } from '../ui/Card';
import { CardHeading } from '../ui/CardHeading';
import type { AnalysisRecommendationProps } from '@/types/dashboard';

export function AnalysisRecommendation({ recommendation }: AnalysisRecommendationProps) {
  return (
    <Card overflow className="p-0">
      <div className="p-6 bg-gradient-to-br from-accent/15 to-accent/8 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Lightbulb className="size-5 text-secondary" />
          </div>
          <div>
            <CardHeading>Strategic Recommendation</CardHeading>
            <p className="text-xs text-muted-foreground">AI-Optimized for maximum revenue impact</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success/30 text-success-foreground">
            {recommendation.actions[0]?.actionType ?? 'Recommendation'}
          </span>
          <span className="text-sm font-bold text-secondary">{recommendation.confidence} confidence</span>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {recommendation.summary}
        </p>
        {recommendation.actions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <ListChecks className="size-3.5" />
              Recommended Actions
            </p>
            <ul className="space-y-2">
              {recommendation.actions.map((action) => (
                <li key={action.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span>
                    <strong>{action.item}</strong>
                    {action.details?.reason && ` — ${action.details.reason}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
