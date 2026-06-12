'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Zap, Clock, TrendingDown, TrendingUp, Minus, Trash2, AlertTriangle, Lightbulb, Hash } from 'lucide-react';
import type { Decision, DecisionStatus } from '@/types/decisions';

const STATUS_CONFIG: Record<DecisionStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  'auto-approved': { icon: Zap, color: '#1fe19e', label: 'Auto-Approved' },
  pending: { icon: Clock, color: '#ffd79f', label: 'Pending Approval' },
  approved: { icon: CheckCircle2, color: '#1fe19e', label: 'Approved' },
  rejected: { icon: XCircle, color: '#ef4444', label: 'Rejected' },
};

const ACTION_CONFIG: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  discount: { icon: TrendingDown, color: '#00d2ff', label: 'Discount' },
  promote: { icon: TrendingUp, color: '#1fe19e', label: 'Promote' },
  hold: { icon: Minus, color: '#859399', label: 'Hold Pricing' },
  remove: { icon: Trash2, color: '#f87171', label: 'Remove Item' },
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
    <AnimatePresence>
      {decision && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-card rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 pb-4 border-b border-white/[0.06]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${actionCfg.color}15`, border: `1px solid ${actionCfg.color}20` }}>
                      <ActionIcon className="w-5 h-5" style={{ color: actionCfg.color }} />
                    </div>
                    <div>
                      <h2 className="text-white text-lg font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        {decision.item}
                      </h2>
                      <p className="text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)', color: statusCfg.color }}>
                        {statusCfg.label}
                      </p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#859399] hover:text-white hover:bg-white/[0.06] transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-xs font-semibold text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>{actionCfg.label}</span>
                  </div>
                  {dp != null && dp > 0 && (
                    <div className="px-3 py-1.5 rounded-lg bg-[#00d2ff]/10 border border-[#00d2ff]/15">
                      <span className="text-xs font-bold text-[#00d2ff]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>-{dp}% discount</span>
                    </div>
                  )}
                </div>

                {details?.reason && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-[#ffd79f]" />
                      <p className="text-[10px] text-[#859399] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Why this action?</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <p className="text-white/80 text-sm leading-relaxed">{details.reason}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#a78bfa]" />
                    <p className="text-[10px] text-[#859399] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>AI Confidence</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-white text-sm font-semibold capitalize">{decision.confidence}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-[#859399]" />
                    <p className="text-[10px] text-[#859399] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Recommendation Summary</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[#859399] text-xs leading-relaxed">{decision.summary}</p>
                  </div>
                </div>

                {details?.priority != null && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Priority</span>
                    <span className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>{details.priority}/5</span>
                  </div>
                )}
              </div>

              {isPending && (
                <div className="p-6 pt-4 border-t border-white/[0.06] flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onReject?.(decision.id); onClose(); }}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onApprove?.(decision.id); onClose(); }}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#1fe19e]/10 border border-[#1fe19e]/20 text-[#1fe19e] text-sm font-bold hover:bg-[#1fe19e]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
