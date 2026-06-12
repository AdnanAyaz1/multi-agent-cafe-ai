'use client';

import { CheckCircle2, XCircle, Clock, Zap, ArrowRight, TrendingDown, TrendingUp, Minus, Trash2 } from 'lucide-react';
import type { Decision, DecisionStatus } from '@/types/decisions';

const STATUS_CONFIG: Record<DecisionStatus, { icon: typeof CheckCircle2; color: string; bg: string; border: string; label: string }> = {
  'auto-approved': { icon: Zap, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Auto-Approved' },
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Pending' },
  approved: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Rejected' },
};

const ACTION_CONFIG: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  discount: { icon: TrendingDown, color: 'text-blue-500', label: 'Discount' },
  promote: { icon: TrendingUp, color: 'text-green-500', label: 'Promote' },
  hold: { icon: Minus, color: 'text-zinc-400', label: 'Hold' },
  remove: { icon: Trash2, color: 'text-red-400', label: 'Remove' },
};

interface DecisionCardProps {
  decision: Decision;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onShowDetails?: (decision: Decision) => void;
  index?: number;
}

export function DecisionCard({ decision, onApprove, onReject, onShowDetails, index = 0 }: DecisionCardProps) {
  const statusCfg = STATUS_CONFIG[decision.status];
  const actionCfg = ACTION_CONFIG[decision.actionType] ?? ACTION_CONFIG.hold;
  const ActionIcon = actionCfg.icon;
  const StatusIcon = statusCfg.icon;
  const details = decision.details as { discountPercent?: number; reason?: string; priority?: number } | null;
  const dp = details?.discountPercent;
  const isPending = decision.status === 'pending';

  return (
    <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-150 ${
      isPending ? 'border-amber-500/10' : ''
    }`}>
      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${statusCfg.bg} border ${statusCfg.border} flex items-center justify-center`}>
              <StatusIcon className={`w-3.5 h-3.5 ${statusCfg.color}`} />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${actionCfg.color}/10`}>
              <ActionIcon className={`w-3 h-3 ${actionCfg.color}`} />
            </div>
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider">
              {actionCfg.label}
            </span>
          </div>
        </div>

        <h3 className="text-white text-sm font-bold mb-1">
          {decision.item}
        </h3>

        {details?.reason && (
          <p className="text-zinc-400 text-xs leading-relaxed mb-3 line-clamp-2">
            {details.reason}
          </p>
        )}

        {dp != null && dp > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
            <TrendingDown className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] text-blue-500 font-bold">
              -{dp}% discount
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <button
            onClick={() => onShowDetails?.(decision)}
            className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-white transition-colors duration-150"
          >
            View details
            <ArrowRight className="w-3 h-3" />
          </button>

          {isPending && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onReject?.(decision.id)}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-all duration-150"
              >
                Reject
              </button>
              <button
                onClick={() => onApprove?.(decision.id)}
                className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold hover:bg-green-500/20 transition-all duration-150"
              >
                Approve
              </button>
            </div>
          )}

          {!isPending && decision.decidedAt && (
            <span className="text-[9px] text-zinc-400">
              {new Date(decision.decidedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
