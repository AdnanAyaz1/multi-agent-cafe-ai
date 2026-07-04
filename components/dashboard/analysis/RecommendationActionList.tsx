import type { PipelineRecommendation } from '@/types/analysis';
import { RecommendationActionItem } from './RecommendationActionItem';
import type { RecommendationActionDetails, RecommendationActionListProps } from '@/types/dashboard';

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
