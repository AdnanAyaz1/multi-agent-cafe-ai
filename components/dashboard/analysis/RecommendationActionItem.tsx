import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RecommendationActionItemProps } from '@/types/dashboard';

export function RecommendationActionItem({
  actionType,
  item,
  details,
}: RecommendationActionItemProps) {
  return (
    <li className="group flex items-start gap-2 rounded-lg border border-border bg-background p-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
        <ChevronRight className="size-3.5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm">
            <span className="font-semibold uppercase tracking-wide">
              {actionType}
            </span>
            <span className="text-muted-foreground"> &mdash; </span>
            <span className="font-medium">{item}</span>
            {details?.discountPercent ? (
              <span className="ml-1 text-success">
                (-{details.discountPercent}%)
              </span>
            ) : null}
          </span>
          {details?.priority != null ? (
            <Badge variant="outline" className="font-mono">
              p{details.priority}
            </Badge>
          ) : null}
        </div>
        {details?.reason ? (
          <p className="mt-1 text-xs text-muted-foreground">{details.reason}</p>
        ) : null}
      </div>
    </li>
  );
}
