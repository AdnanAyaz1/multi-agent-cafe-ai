import { cn } from '@/lib/utils';
import type { EmptyStateProps } from '@/types/dashboard';

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl p-12 shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10 flex flex-col items-center justify-center text-center min-h-[300px]',
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-card-foreground mb-2 font-heading">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
  );
}
