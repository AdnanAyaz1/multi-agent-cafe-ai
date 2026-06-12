'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div className="h-px w-12 bg-gradient-to-r from-[#00d2ff] to-transparent" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ transformOrigin: 'left' }} />
          <p className="text-[11px] text-[#00d2ff] uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Competitor Intelligence</p>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Competitor <span className="gradient-text">Insights</span>
            </h1>
            <p className="text-[#859399] text-sm lg:text-base max-w-lg">Scrape competitor websites, track pricing changes, and get AI-powered alerts.</p>
          </div>
          <motion.button onClick={() => reload()} disabled={loading || busy} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#859399] text-sm font-medium hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-white disabled:opacity-50 transition-all duration-300 flex items-center gap-2 flex-shrink-0">
            <RefreshCw className={`w-4 h-4 ${loading || busy ? 'animate-spin' : ''}`} />
            Reload
          </motion.button>
        </div>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { label: 'Snapshots', value: String(snapshots.length), color: '#00d2ff' },
          { label: 'Items Tracked', value: String(totalItems), color: '#1fe19e' },
          { label: 'Active Promos', value: String(totalPromos), color: '#ffd79f' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }} className="glass-card rounded-2xl p-4 group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-[25px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `${stat.color}12` }} />
            <p className="text-[10px] text-[#859399] uppercase tracking-[0.15em] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{stat.label}</p>
            <p className="text-2xl font-extrabold text-white mt-1" style={{ fontFamily: 'var(--font-montserrat)' }}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Scrape form */}
      <ScrapeForm businessId={DEFAULT_BUSINESS_ID} disabled={loading} busy={busy} onSubmit={(opts) => refresh(opts)} />

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status bar */}
      {busy && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-[#00d2ff]">
          <Loader2 className="w-4 h-4 animate-spin" />
          {polling ? 'Waiting for worker to finish...' : 'Enqueueing scrape job...'}
        </motion.div>
      )}

      {/* Snapshots */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-3xl p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-white/[0.06] rounded w-1/3" />
                  <div className="h-3 bg-white/[0.04] rounded w-2/3" />
                  <div className="space-y-2">
                    <div className="h-3 bg-white/[0.03] rounded" />
                    <div className="h-3 bg-white/[0.03] rounded" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : snapshots.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-16 text-center relative overflow-hidden">
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ background: ['radial-gradient(ellipse at 30% 50%, rgba(0,210,255,0.03) 0%, transparent 60%)', 'radial-gradient(ellipse at 70% 50%, rgba(31,225,158,0.03) 0%, transparent 60%)', 'radial-gradient(ellipse at 30% 50%, rgba(0,210,255,0.03) 0%, transparent 60%)'] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            <div className="relative z-10">
              <motion.div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <Inbox className="w-10 h-10 text-[#859399]" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-montserrat)' }}>No snapshots yet</h3>
              <p className="text-[#859399] text-sm max-w-sm mx-auto">Run a scrape above. New data appears here once the worker finishes (typically 5-30 seconds).</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-[10px] text-[#859399] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              {snapshots.length} snapshot{snapshots.length === 1 ? '' : 's'}
            </p>
            {snapshots.map((snapshot, i) => (
              <SnapshotCard key={snapshot.id} snapshot={snapshot} index={i} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
