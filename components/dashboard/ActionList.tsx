'use client';

import type { RecommendationAction } from '@/lib/api/analysis';

interface ActionListProps {
  actions: RecommendationAction[];
}

export function ActionList({ actions }: ActionListProps) {
  if (actions.length === 0) {
    return <p className="text-sm text-gray-500">No actions.</p>;
  }

  return (
    <ul className="space-y-1 text-sm">
      {actions.map((a) => {
        const discount = a.details.discountPercent;
        const priority = a.details.priority;
        const reason = a.details.reason;

        return (
          <li key={a.id} className="rounded border bg-gray-50 p-2">
            <div className="flex items-center justify-between">
              <span>
                <strong className="uppercase">{a.actionType}</strong> &mdash;{' '}
                {a.item}
                {discount ? ` (-${discount}%)` : ''}
              </span>
              {priority != null && (
                <span className="text-xs text-gray-500">p{priority}</span>
              )}
            </div>
            {reason && <p className="mt-1 text-xs text-gray-600">{reason}</p>}
          </li>
        );
      })}
    </ul>
  );
}
