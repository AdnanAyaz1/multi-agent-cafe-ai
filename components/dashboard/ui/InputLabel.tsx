import { cn } from '@/lib/utils';
import type { InputLabelProps } from '@/types/dashboard';

export function InputLabel({ children, className }: InputLabelProps) {
  return (
    <label className={cn('block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider', className)}>
      {children}
    </label>
  );
}
