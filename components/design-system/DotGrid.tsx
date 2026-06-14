import { cn } from "@/lib/utils";
import type { DotGridProps } from '@/types/design-system';

export function DotGrid({ className, fixed = true }: DotGridProps) {
  return (
    <div
      className={cn(
        fixed && "fixed inset-0",
        "dot-grid pointer-events-none z-10 opacity-50",
        className
      )}
    />
  );
}
