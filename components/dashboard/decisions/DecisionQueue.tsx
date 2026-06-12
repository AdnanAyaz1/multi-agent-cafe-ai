'use client';

import { Clock, CheckCircle2, Zap } from 'lucide-react';
import type { Decision } from '@/types/decisions';
import { DecisionCard } from './DecisionCard';

interface DecisionQueueProps {
  pending: Decision[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onShowDetails: (decision: Decision) => void;
  onBulkApprove: () => void;
}

export function DecisionQueue({ pending, onApprove, onReject, onShowDetails, onBulkApprove }: DecisionQueueProps) {
  if (pending.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-12 text-center">
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">All clear</h3>
          <p className="text-zinc-400 text-sm max-w-xs mx-auto">No pending decisions. Run an analysis to get AI recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Clock className="w-3 h-3 text-amber-500" />
          </div>
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
            {pending.length} pending decision{pending.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={onBulkApprove}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold hover:bg-green-500/20 transition-all duration-150"
        >
          <Zap className="w-3 h-3" />
          Approve all
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {pending.map((decision, i) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            onApprove={onApprove}
            onReject={onReject}
            onShowDetails={onShowDetails}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
