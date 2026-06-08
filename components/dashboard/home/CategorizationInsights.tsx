import { Card } from '../ui/Card';
import { CardHeading } from '../ui/CardHeading';
import type { CategorizationInsightsProps } from '@/types/dashboard';

export function CategorizationInsights({ insights }: CategorizationInsightsProps) {
  return (
    <Card padding="lg">
      <CardHeading className="mb-6">Categorization Insights</CardHeading>
      <div className="grid grid-cols-2 gap-4">
        {insights.map((cat) => (
          <div
            key={cat.name}
            className="bg-white/40 p-3 rounded-lg border border-white/50"
          >
            <p className="text-xs text-muted-foreground font-bold uppercase">
              {cat.name}
            </p>
            <p className={`text-lg font-semibold ${cat.color}`}>
              {cat.trend}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
