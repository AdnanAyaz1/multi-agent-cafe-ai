'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, History, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useDecisions } from '@/hooks/useDecisions';
import { DEFAULT_BUSINESS_ID } from '@/constants/pipeline';
import { DecisionQueue } from '@/components/dashboard/decisions/DecisionQueue';
import { DecisionHistory } from '@/components/dashboard/decisions/DecisionHistory';
import { DecisionDetailsModal } from '@/components/dashboard/decisions/DecisionDetailsModal';
import type { Decision } from '@/types/decisions';

export default function DecisionsPage() {
  const { pending, decisions, loading, page, totalPages, total, setPage, approveDecision, rejectDecision, bulkApprove } = useDecisions(DEFAULT_BUSINESS_ID);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');

  const historyLogs = useMemo(() =>
    decisions.filter((d) => d.status !== 'pending').map((d) => ({
      id: `${d.id}-log`,
      decisionId: d.id,
      action: d.actionType,
      item: d.item,
      discountPercent: (d.details as { discountPercent?: number } | null)?.discountPercent,
      status: d.status as 'auto-approved' | 'approved' | 'rejected',
      decidedAt: d.decidedAt ?? d.createdAt,
      reason: d.reason,
    })),
    [decisions]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div className="h-px w-12 bg-gradient-to-r from-[#ffd79f] to-transparent" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ transformOrigin: 'left' }} />
          <p className="text-[11px] text-[#ffd79f] uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Decision Center</p>
        </div>
        <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>
          AI <span className="gradient-text">Decisions</span>
        </h1>
        <p className="text-[#859399] text-sm lg:text-base max-w-lg">
          Review, approve, or reject AI-powered pricing and promotion decisions.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: 'Pending', value: String(pending.length), color: '#ffd79f', icon: Clock },
          { label: 'Decided', value: String(total - pending.length), color: '#1fe19e', icon: ShieldCheck },
          { label: 'Total', value: String(total), color: '#00d2ff', icon: History },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }} className="glass-card rounded-2xl p-4 group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-[25px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `${stat.color}12` }} />
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
              <p className="text-[10px] text-[#859399] uppercase tracking-[0.15em] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{stat.label}</p>
            </div>
            <p className="text-2xl font-extrabold text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('pending')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
            tab === 'pending'
              ? 'bg-white/[0.08] border border-white/[0.12] text-white'
              : 'bg-white/[0.02] border border-transparent text-[#859399] hover:bg-white/[0.05] hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
            tab === 'history'
              ? 'bg-white/[0.08] border border-white/[0.12] text-white'
              : 'bg-white/[0.02] border border-transparent text-[#859399] hover:bg-white/[0.05] hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          History
        </button>
      </div>

      {/* Content */}
      {tab === 'pending' ? (
        <DecisionQueue
          pending={pending}
          onApprove={approveDecision}
          onReject={rejectDecision}
          onShowDetails={setSelectedDecision}
          onBulkApprove={() => bulkApprove(pending.map((d) => d.id))}
        />
      ) : (
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-[#859399] animate-spin" />
            </div>
          )}
          {!loading && <DecisionHistory logs={historyLogs} />}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-[10px] text-[#859399]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                Page {page} of {totalPages} · {total} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#859399] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page + i - 2;
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        p === page
                          ? 'bg-white/[0.08] border border-white/[0.12] text-white'
                          : 'text-[#859399] hover:text-white hover:bg-white/[0.04]'
                      }`}
                      style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[#859399] hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      <DecisionDetailsModal
        decision={selectedDecision}
        onClose={() => setSelectedDecision(null)}
        onApprove={approveDecision}
        onReject={rejectDecision}
      />
    </div>
  );
}
