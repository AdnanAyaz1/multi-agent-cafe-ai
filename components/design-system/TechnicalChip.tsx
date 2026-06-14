import { cn } from "@/lib/utils";
import type { TechnicalChipProps } from '@/types/design-system';

export function TechnicalChip({
  children,
  className,
  variant = "default",
}: TechnicalChipProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-xl",
        variant === "default" && "bg-white/[0.04] border border-white/[0.08]",
        variant === "outline" && "border border-white/[0.12] bg-transparent",
        className
      )}
    >
      {children}
    </div>
  );
}
