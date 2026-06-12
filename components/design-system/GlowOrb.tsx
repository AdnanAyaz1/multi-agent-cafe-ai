import { cn } from "@/lib/utils";

interface GlowOrbProps {
  color?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
  className?: string;
  position?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}

export function GlowOrb({
  color = "primary",
  size = "md",
  className,
  position = {},
}: GlowOrbProps) {
  const sizeClasses = {
    sm: "w-[400px] h-[400px]",
    md: "w-[600px] h-[600px]",
    lg: "w-[800px] h-[800px]",
  };

  const colorClasses = {
    primary: "bg-[#00d2ff]",
    secondary: "bg-[#1fe19e]",
    tertiary: "bg-[#ffd79f]",
  };

  return (
    <div
      className={cn(
        "glow-orb rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      style={position}
    />
  );
}
