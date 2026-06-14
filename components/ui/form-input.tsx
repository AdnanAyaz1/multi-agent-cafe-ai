import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { FormInputProps } from '@/types/ui';

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-white placeholder-[#a09890]/40',
          'focus:outline-none focus:ring-1 transition-all text-sm',
          error
            ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30'
            : 'border-white/[0.08] focus:border-[#e07850]/50 focus:ring-[#e07850]/30',
          className
        )}
        {...props}
      />
    );
  }
);

FormInput.displayName = 'FormInput';
