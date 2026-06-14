import { cn } from "@/lib/utils";
import type { GlassCardProps } from '@/types/landing';

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl",
        hover && "transition-all duration-500 group card-glow",
        className
      )}
    >
      {children}
    </div>
  );
}
