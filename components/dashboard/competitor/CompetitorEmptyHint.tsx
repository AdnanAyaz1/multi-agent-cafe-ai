import type { CompetitorEmptyHintProps } from '@/types/dashboard';

export function CompetitorEmptyHint({ message }: CompetitorEmptyHintProps) {
  return <div className="p-4 text-sm text-muted-foreground">{message}</div>;
}
