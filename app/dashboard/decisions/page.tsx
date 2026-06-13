'use client';

import { useState, useMemo } from 'react';
import { ShieldCheck, History, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useDecisions } from '@/hooks/useDecisions';
import { DEFAULT_BUSINESS_ID } from '@/constants/pipeline';
import { DecisionQueue } from '@/components/dashboard/decisions/DecisionQueue';
import { DecisionHistory } from '@/components/dashboard/decisions/DecisionHistory';
import { DecisionDetailsModal } from '@/components/dashboard/decisions/DecisionDetailsModal';
import type { Decision } from '@/types/decisions';

export default function DecisionsPage() {
  const { pending, decisions, logs, loading, page, totalPages, total, setPage, approveDecision, rejectDecision, bulkApprove } = useDecisions(DEFAULT_BUSINESS_ID);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [tab, setTab] = useState<'pending' | 'history'>('pending');

  const historyLogs = useMemo(() =>
    logs.filter((l) => l.status !== 'pending'),
    [logs]
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-amber-500" />
          <p className="text-[11px] text-amber-500 uppercase tracking-[0.2em] font-semibold">Decision Center</p>
        </div>
        <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
          AI Decisions
        </h1>
        <p className="text-zinc-400 text-sm lg:text-base max-w-lg">
          Review, approve, or reject AI-powered pricing and promotion decisions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: String(pending.length), Icon: Clock, iconColor: 'text-amber-500' },
          { label: 'Decided', value: String(total - pending.length), Icon: ShieldCheck, iconColor: 'text-green-500' },
          { label: 'Total', value: String(total), Icon: History, iconColor: 'text-[#e07850]' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
              <p className="text-[10px] text-zinc-400 uppercase tracking-[0.15em] font-semibold">{stat.label}</p>
            </div>
            <p className="text-2xl font-extrabold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('pending')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
            tab === 'pending'
              ? 'bg-zinc-800 border border-zinc-700 text-white'
              : 'bg-zinc-900 border border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
            tab === 'history'
              ? 'bg-zinc-800 border border-zinc-700 text-white'
              : 'bg-zinc-900 border border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
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
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
            </div>
          )}
          {!loading && <DecisionHistory logs={historyLogs} />}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-[10px] text-zinc-400">
                Page {page} of {totalPages} · {total} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
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
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-150 ${
                        p === page
                          ? 'bg-zinc-800 border border-zinc-700 text-white'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
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
