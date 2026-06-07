'use client';

import { AlertCircle, Globe, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DEFAULT_BUSINESS_ID } from '@/constants/pipeline';
import { COMPETITOR_DEFAULT_LIMIT } from '@/constants/competitor';
import { useCompetitorSnapshots } from '@/hooks/useCompetitorSnapshots';
import { CompetitorScrapeForm } from './competitor/CompetitorScrapeForm';
import { CompetitorSnapshotCard } from './competitor/CompetitorSnapshotCard';

export default function CompetitorPanel() {
  const {
    businessId,
    businessName,
    snapshots,
    loading,
    refreshing,
    polling,
    error,
    refresh,
    reload,
  } = useCompetitorSnapshots(DEFAULT_BUSINESS_ID);

  const busy = refreshing || polling;

  return (
    <Card id="competitor" className="h-full scroll-mt-20">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            <Globe className="size-3.5" aria-hidden />
            Competitor scraping
          </div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Crawlee + Playwright + LLM parser
          </h2>
          <p className="text-xs text-muted-foreground">
            Enqueue a BullMQ{' '}
            <span className="font-mono text-foreground/80">competitor-collect</span>{' '}
            job, then watch new snapshots land as the worker finishes scraping and parsing.
          </p>
        </div>
        {businessId ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void reload()}
            disabled={busy || loading}
            className="gap-1.5"
          >
            <RefreshCw
              className={loading || busy ? 'size-4 animate-spin' : 'size-4'}
              aria-hidden
            />
            Reload
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        {businessId ? (
          <CompetitorScrapeForm
            businessId={businessId}
            disabled={loading}
            busy={busy}
            onSubmit={(options) => void refresh(options)}
          />
        ) : null}

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>{error}</p>
          </div>
        ) : null}

        {loading ? (
          <SnapshotSkeletonList />
        ) : snapshots.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {businessName ? (
                  <>
                    Showing {snapshots.length} snapshot
                    {snapshots.length === 1 ? '' : 's'} for{' '}
                    <span className="font-medium text-foreground/80">{businessName}</span>
                  </>
                ) : (
                  <>
                    Showing {snapshots.length} snapshot
                    {snapshots.length === 1 ? '' : 's'}
                  </>
                )}
              </span>
              {busy ? (
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                  {polling ? 'Waiting for worker…' : 'Enqueueing…'}
                </span>
              ) : null}
            </div>
            <ul className="space-y-3">
              {snapshots.map((snapshot) => (
                <li key={snapshot.id}>
                  <CompetitorSnapshotCard
                    data={snapshot.data}
                    collectedAt={snapshot.collectedAt}
                    expiresAt={snapshot.expiresAt}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SnapshotSkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: COMPETITOR_DEFAULT_LIMIT }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-32 w-full rounded-2xl"
          aria-label="Loading snapshot"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
      <Inbox className="size-8 text-muted-foreground" aria-hidden />
      <p className="text-sm font-medium text-foreground/80">No snapshots yet</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Run a scrape above. New <span className="font-mono">DataSnapshot</span>{' '}
        rows appear here once the worker finishes (typically 5–30 seconds).
      </p>
    </div>
  );
}
