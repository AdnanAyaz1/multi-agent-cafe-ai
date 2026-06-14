import { cn } from '@/lib/utils';
import type { FormFieldProps } from '@/types/ui';

export function FormField({ label, error, children, className, mono = true }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          className="block text-[11px] font-medium text-[#a09890] uppercase tracking-[0.15em]"
          style={mono ? { fontFamily: 'var(--font-jetbrains-mono)' } : undefined}
        >
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
