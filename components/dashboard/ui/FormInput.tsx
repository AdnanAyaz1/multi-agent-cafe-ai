import { cn } from '@/lib/utils';

export function FormInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full bg-input border border-border rounded-lg px-4 py-3 text-sm',
        'focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none transition-all',
        'disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
