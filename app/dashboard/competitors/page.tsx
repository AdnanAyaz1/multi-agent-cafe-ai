'use client';

import { RefreshCw, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { useCompetitorSnapshots } from '@/hooks/useCompetitorSnapshots';
import { DEFAULT_BUSINESS_ID } from '@/constants/pipeline';
import { ScrapeForm } from '@/components/dashboard/competitor/ScrapeForm';
import { SnapshotCard } from '@/components/dashboard/competitor/SnapshotCard';

export default function CompetitorsPage() {
  const { snapshots, loading, refreshing, polling, error, refresh, reload } = useCompetitorSnapshots(DEFAULT_BUSINESS_ID);
  const busy = refreshing || polling;

  const totalItems = snapshots.reduce((sum, s) => sum + s.data.items.length, 0);
  const totalPromos = snapshots.reduce((sum, s) => sum + s.data.promos.length, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-[#e07850]" />
          <p className="text-[11px] text-[#e07850] uppercase tracking-[0.2em] font-semibold">Competitor Intelligence</p>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
              Competitor Insights
            </h1>
            <p className="text-zinc-400 text-sm lg:text-base max-w-lg">Scrape competitor websites, track pricing changes, and get AI-powered alerts.</p>
          </div>
          <button onClick={() => reload()} disabled={loading || busy} className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 text-sm font-medium hover:bg-zinc-800 hover:text-white disabled:opacity-50 transition-all duration-150 flex items-center gap-2 flex-shrink-0">
            <RefreshCw className={`w-4 h-4 ${loading || busy ? 'animate-spin' : ''}`} />
            Reload
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Snapshots', value: String(snapshots.length) },
          { label: 'Items Tracked', value: String(totalItems) },
          { label: 'Active Promos', value: String(totalPromos) },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4">
            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.15em] font-semibold">{stat.label}</p>
            <p className="text-2xl font-extrabold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Scrape form */}
      <ScrapeForm businessId={DEFAULT_BUSINESS_ID} disabled={loading} busy={busy} onSubmit={(opts) => refresh(opts)} />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Status bar */}
      {busy && (
        <div className="flex items-center gap-2 text-sm text-[#e07850]">
          <Loader2 className="w-4 h-4 animate-spin" />
          {polling ? 'Waiting for worker to finish...' : 'Enqueueing scrape job...'}
        </div>
      )}

      {/* Snapshots */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-zinc-800 rounded w-1/3" />
                <div className="h-3 bg-zinc-900 rounded w-2/3" />
                <div className="space-y-2">
                  <div className="h-3 bg-zinc-900 rounded" />
                  <div className="h-3 bg-zinc-900 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : snapshots.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
            <Inbox className="w-10 h-10 text-zinc-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No snapshots yet</h3>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">Run a scrape above. New data appears here once the worker finishes (typically 5-30 seconds).</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
            {snapshots.length} snapshot{snapshots.length === 1 ? '' : 's'}
          </p>
          {snapshots.map((snapshot, i) => (
            <SnapshotCard key={snapshot.id} snapshot={snapshot} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
