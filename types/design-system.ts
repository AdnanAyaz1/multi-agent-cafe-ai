import type { ReactNode } from 'react';

export interface GlowOrbProps {
  color?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  position?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
}

export interface TechnicalChipProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

export interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p';
}

export interface DotGridProps {
  className?: string;
  fixed?: boolean;
}
