import { cn } from "@/lib/utils";
import type { GradientTextProps } from '@/types/design-system';

export function GradientText({
  children,
  className,
  as: Component = "span",
}: GradientTextProps) {
  return (
    <Component className={cn("gradient-text", className)}>
      {children}
    </Component>
  );
}
