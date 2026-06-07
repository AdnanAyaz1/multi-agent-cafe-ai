import { Sparkles } from 'lucide-react';
import type { CompetitorPromo } from '@/lib/types';

export interface CompetitorPromoListProps {
  promos: CompetitorPromo[];
}

export function CompetitorPromoList({ promos }: CompetitorPromoListProps) {
  return (
    <section className="space-y-2 p-4">
      <h5 className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Sparkles className="size-3" aria-hidden />
        Promotions
      </h5>
      <ul className="space-y-1.5 text-sm">
        {promos.map((promo, index) => (
          <li
            key={`${promo.text}-${index}`}
            className="rounded-lg border border-border/40 bg-muted/30 px-3 py-2"
          >
            <div className="font-medium">{promo.text}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {promo.discountPercent !== undefined ? (
                <span className="font-mono">-{promo.discountPercent}%</span>
              ) : null}
              {promo.validUntil ? (
                <span>valid until {promo.validUntil}</span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
