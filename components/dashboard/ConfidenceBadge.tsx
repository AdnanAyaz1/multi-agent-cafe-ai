import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

const CONFIDENCE_CLASS: Record<ConfidenceLevel, string> = {
  high: 'bg-success/15 text-success-foreground ring-1 ring-success/30 hover:bg-success/15',
  medium:
    'bg-warning/15 text-warning-foreground ring-1 ring-warning/30 hover:bg-warning/15',
  low: 'bg-destructive/15 text-destructive ring-1 ring-destructive/30 hover:bg-destructive/15',
};

const FALLBACK_CLASS = 'bg-muted text-muted-foreground';

export function ConfidenceBadge({ level }: { level: string }) {
  const key = level.toLowerCase() as ConfidenceLevel;
  const className = cn(
    'gap-1 capitalize',
    CONFIDENCE_CLASS[key] ?? FALLBACK_CLASS
  );
  return <Badge className={className}>{level} confidence</Badge>;
}
