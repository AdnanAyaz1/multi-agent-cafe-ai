import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { value: string; label: string }[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, error, options, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-white',
          'focus:outline-none focus:ring-1 transition-all text-sm appearance-none',
          error
            ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30'
            : 'border-white/[0.08] focus:border-[#00d2ff]/50 focus:ring-[#00d2ff]/30',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0e1417] text-white">
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

FormSelect.displayName = 'FormSelect';
