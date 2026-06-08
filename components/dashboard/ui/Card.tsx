import { cn } from '@/lib/utils';
import type { CardProps } from '@/types/dashboard';
import { CARD_PADDING_MAP } from '@/constants/card';

export function Card({ children, className, padding = 'md', overflow = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl shadow-sm ring-1 ring-foreground/5 dark:ring-foreground/10',
        overflow && 'overflow-hidden',
        CARD_PADDING_MAP[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
