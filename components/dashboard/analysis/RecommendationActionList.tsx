import type { PipelineRecommendation } from '@/hooks/useAnalysis';
import {
  RecommendationActionItem,
  type RecommendationActionDetails,
} from './RecommendationActionItem';

export interface RecommendationActionListProps {
  actions: NonNullable<PipelineRecommendation>['actions'];
}

export function RecommendationActionList({ actions }: RecommendationActionListProps) {
  return (
    <ul className="space-y-1.5">
      {actions.map((action) => (
        <RecommendationActionItem
          key={action.id}
          actionType={action.actionType}
          item={action.item}
          details={action.details as RecommendationActionDetails | null}
        />
      ))}
    </ul>
  );
}
