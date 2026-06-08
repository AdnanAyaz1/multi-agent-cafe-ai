import { cn } from '@/lib/utils';
import type { StatCardGridProps } from '@/types/dashboard';

export function StatCardGrid({ cards, className }: StatCardGridProps) {
  return (
    <section className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8', className)}>
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card rounded-xl p-6 shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10 flex items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-lg ${card.iconBg} flex items-center justify-center`}>
            <card.icon className={`size-6 ${card.iconColor}`} />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {card.label}
            </p>
            <p className="text-lg font-semibold text-card-foreground">{card.value}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
