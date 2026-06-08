import { Card } from '../ui/Card';
import { CardHeading } from '../ui/CardHeading';
import type { RecentRunsProps } from '@/types/dashboard';

export function RecentRuns({ runs }: RecentRunsProps) {
  return (
    <Card>
      <CardHeading className="mb-4">Recent Runs</CardHeading>
      <ul className="space-y-3">
        {runs.map((run) => (
          <li
            key={run.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
          >
            <div>
              <p className="text-sm font-semibold text-card-foreground">{run.businessId}</p>
              <p className="text-xs text-muted-foreground">{run.completedAt}</p>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                run.status === 'complete'
                  ? 'bg-success/30 text-success-foreground'
                  : 'bg-destructive/5 text-destructive'
              }`}
            >
              {run.status}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
