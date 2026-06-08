import { cn } from '@/lib/utils';
import type { ErrorAlertProps } from '@/types/dashboard';

export function ErrorAlert({ message, className }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive',
        className
      )}
    >
      {message}
    </div>
  );
}
