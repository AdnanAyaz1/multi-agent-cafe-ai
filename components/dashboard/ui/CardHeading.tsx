import { cn } from '@/lib/utils';
import type { CardHeadingProps } from '@/types/dashboard';

export function CardHeading({ children, className }: CardHeadingProps) {
  return (
    <h3 className={cn('text-xl font-bold text-card-foreground font-heading', className)}>
      {children}
    </h3>
  );
}
