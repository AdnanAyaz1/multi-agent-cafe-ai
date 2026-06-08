import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SubmitButtonProps } from '@/types/dashboard';

export function SubmitButton({
  children,
  onClick,
  type = 'button',
  loading = false,
  disabled = false,
  className,
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        'caramel-gradient text-primary-foreground font-bold px-6 py-3 rounded-xl',
        'hover:shadow-lg transition-all flex items-center justify-center gap-2',
        'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        className
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
