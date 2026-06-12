import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl",
        hover && "transition-all duration-500 hover:border-[#00d2ff]/30 group card-glow",
        className
      )}
    >
      {children}
    </div>
  );
}
