'use client';

import { X, CheckCircle2, XCircle, Zap, Clock, TrendingDown, TrendingUp, Minus, Trash2, AlertTriangle, Lightbulb, Hash } from 'lucide-react';
import type { Decision, DecisionStatus } from '@/types/decisions';

const STATUS_CONFIG: Record<DecisionStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  'auto-approved': { icon: Zap, color: 'text-green-500', label: 'Auto-Approved' },
  pending: { icon: Clock, color: 'text-amber-500', label: 'Pending Approval' },
  approved: { icon: CheckCircle2, color: 'text-green-500', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-400', label: 'Rejected' },
};

const ACTION_CONFIG: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  discount: { icon: TrendingDown, color: 'text-blue-500', label: 'Discount' },
  promote: { icon: TrendingUp, color: 'text-green-500', label: 'Promote' },
  hold: { icon: Minus, color: 'text-zinc-400', label: 'Hold Pricing' },
  remove: { icon: Trash2, color: 'text-red-400', label: 'Remove Item' },
};

interface DecisionDetailsModalProps {
  decision: Decision | null;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function DecisionDetailsModal({ decision, onClose, onApprove, onReject }: DecisionDetailsModalProps) {
  if (!decision) return null;

  const statusCfg = STATUS_CONFIG[decision.status];
  const actionCfg = ACTION_CONFIG[decision.actionType] ?? ACTION_CONFIG.hold;
  const ActionIcon = actionCfg.icon;
  const details = decision.details as { discountPercent?: number; reason?: string; priority?: number } | null;
  const dp = details?.discountPercent;
  const isPending = decision.status === 'pending';

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 pb-4 border-b border-zinc-800">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${actionCfg.color}/10 border border-${actionCfg.color === 'text-blue-500' ? 'blue-500' : actionCfg.color === 'text-green-500' ? 'green-500' : 'zinc-700'}/20`}>
                  <ActionIcon className={`w-5 h-5 ${actionCfg.color}`} />
                </div>
                <div>
                  <h2 className="text-white text-lg font-bold">
                    {decision.item}
                  </h2>
                  <p className={`text-[10px] uppercase tracking-wider ${statusCfg.color}`}>
                    {statusCfg.label}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-150">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-xs font-semibold text-white">{actionCfg.label}</span>
              </div>
              {dp != null && dp > 0 && (
                <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <span className="text-xs font-bold text-blue-500">-{dp}% discount</span>
                </div>
              )}
            </div>

            {details?.reason && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Why this action?</p>
                </div>
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-white/80 text-sm leading-relaxed">{details.reason}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">AI Confidence</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-white text-sm font-semibold capitalize">{decision.confidence}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-zinc-400" />
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Recommendation Summary</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <p className="text-zinc-400 text-xs leading-relaxed">{decision.summary}</p>
              </div>
            </div>

            {details?.priority != null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Priority</span>
                <span className="text-white text-sm font-bold">{details.priority}/5</span>
              </div>
            )}
          </div>

          {isPending && (
            <div className="p-6 pt-4 border-t border-zinc-800 flex items-center gap-3">
              <button
                onClick={() => { onReject?.(decision.id); onClose(); }}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all duration-150 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => { onApprove?.(decision.id); onClose(); }}
                className="flex-1 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm font-bold hover:bg-green-500/20 transition-all duration-150 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
