export interface CompetitorEmptyHintProps {
  message: string;
}

export function CompetitorEmptyHint({ message }: CompetitorEmptyHintProps) {
  return <div className="p-4 text-sm text-muted-foreground">{message}</div>;
}
