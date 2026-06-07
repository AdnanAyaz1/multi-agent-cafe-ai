import { ExternalLink, Tag, Sparkles, Clock, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatTimestamp } from '@/lib/format';
import type { CompetitorData } from '@/lib/types';
import { CompetitorItemTable } from './CompetitorItemTable';
import { CompetitorPromoList } from './CompetitorPromoList';
import { CompetitorNotesList } from './CompetitorNotesList';
import { CompetitorEmptyHint } from './CompetitorEmptyHint';

export interface CompetitorSnapshotCardProps {
  data: CompetitorData;
  collectedAt: string;
  expiresAt: string;
}

export function CompetitorSnapshotCard({
  data,
  collectedAt,
  expiresAt,
}: CompetitorSnapshotCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/40 bg-muted/30 p-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-heading text-base font-semibold tracking-tight">
              {data.brand ?? 'Unbranded competitor'}
            </h4>
            <Badge variant="secondary" className="gap-1">
              <Tag className="size-3" aria-hidden />
              {data.items.length} items
            </Badge>
            {data.promos.length > 0 ? (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="size-3 text-primary" aria-hidden />
                {data.promos.length} promo{data.promos.length === 1 ? '' : 's'}
              </Badge>
            ) : null}
          </div>
          <a
            href={data.finalUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{data.finalUrl}</span>
          </a>
        </div>
        <div className="flex flex-col items-end gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          <div className="inline-flex items-center gap-1">
            <Clock className="size-3" aria-hidden />
            <time dateTime={collectedAt}>{formatTimestamp(collectedAt)}</time>
          </div>
          <div className="inline-flex items-center gap-1">
            <Hash className="size-3" aria-hidden />
            <span>expires {formatTimestamp(expiresAt)}</span>
          </div>
        </div>
      </header>

      {data.items.length > 0 ? (
        <CompetitorItemTable items={data.items} />
      ) : (
        <CompetitorEmptyHint message="No menu items were extracted." />
      )}

      {data.promos.length > 0 ? (
        <>
          <Separator />
          <CompetitorPromoList promos={data.promos} />
        </>
      ) : null}

      {data.notes.length > 0 ? (
        <>
          <Separator />
          <CompetitorNotesList notes={data.notes} />
        </>
      ) : null}
    </article>
  );
}
