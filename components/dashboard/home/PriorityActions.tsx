import { CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { CardHeading } from '../ui/CardHeading';
import type { PriorityActionsProps } from '@/types/dashboard';

export function PriorityActions({ actions }: PriorityActionsProps) {
  return (
    <Card>
      <CardHeading className="mb-4">Priority Actions</CardHeading>
      <ul className="space-y-3">
        {actions.map((action) => (
          <li
            key={action}
            className="flex items-start gap-3 text-sm text-muted-foreground"
          >
            <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
            <span>{action}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
