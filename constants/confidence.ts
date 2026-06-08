import type { ConfidenceLevel } from '@/types/dashboard';

export const CONFIDENCE_CLASS: Record<ConfidenceLevel, string> = {
  high: 'bg-success/15 text-success-foreground ring-1 ring-success/30 hover:bg-success/15',
  medium:
    'bg-warning/15 text-warning-foreground ring-1 ring-warning/30 hover:bg-warning/15',
  low: 'bg-destructive/15 text-destructive ring-1 ring-destructive/30 hover:bg-destructive/15',
};

export const CONFIDENCE_FALLBACK_CLASS = 'bg-muted text-muted-foreground';
