import type { ReactNode } from 'react';

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export interface HeroRevealProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface CountingNumberProps {
  target: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}
