import { cn } from '@/lib/utils';
import type { PageHeaderProps } from '@/types/dashboard';

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-8', className)}>
      <h1 className="text-3xl font-bold text-foreground mb-2 font-heading">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </header>
  );
}
