import { Inbox } from 'lucide-react';

export function CompetitorEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
      <Inbox className="size-8 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium text-foreground/80">No snapshots yet</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Run a scrape above. New <span className="font-mono">DataSnapshot</span>{' '}
        rows appear here once the worker finishes (typically 5–30 seconds).
      </p>
    </div>
  );
}
