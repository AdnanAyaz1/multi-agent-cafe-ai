import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CONFIDENCE_CLASS, CONFIDENCE_FALLBACK_CLASS } from '@/constants/confidence';
import type { ConfidenceLevel } from '@/types/dashboard';

export function ConfidenceBadge({ level }: { level: string }) {
  const key = level.toLowerCase() as ConfidenceLevel;
  const className = cn(
    'gap-1 capitalize',
    CONFIDENCE_CLASS[key] ?? CONFIDENCE_FALLBACK_CLASS
  );
  return <Badge className={className}>{level} confidence</Badge>;
}
