'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Zap, ArrowRight, TrendingDown, TrendingUp, Minus, Trash2 } from 'lucide-react';
import type { Decision, DecisionStatus } from '@/types/decisions';

const STATUS_CONFIG: Record<DecisionStatus, { icon: typeof CheckCircle2; color: string; bg: string; border: string; label: string }> = {
  'auto-approved': { icon: Zap, color: 'text-[#1fe19e]', bg: 'bg-[#1fe19e]/10', border: 'border-[#1fe19e]/15', label: 'Auto-Approved' },
  pending: { icon: Clock, color: 'text-[#ffd79f]', bg: 'bg-[#ffd79f]/10', border: 'border-[#ffd79f]/15', label: 'Pending' },
  approved: { icon: CheckCircle2, color: 'text-[#1fe19e]', bg: 'bg-[#1fe19e]/10', border: 'border-[#1fe19e]/15', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/15', label: 'Rejected' },
};

const ACTION_CONFIG: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  discount: { icon: TrendingDown, color: '#00d2ff', label: 'Discount' },
  promote: { icon: TrendingUp, color: '#1fe19e', label: 'Promote' },
  hold: { icon: Minus, color: '#859399', label: 'Hold' },
  remove: { icon: Trash2, color: '#f87171', label: 'Remove' },
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-card rounded-2xl overflow-hidden group relative transition-all duration-300 ${
        isPending ? 'border-[#ffd79f]/10' : ''
      }`}
    >
      {isPending && <div className="absolute inset-0 bg-gradient-to-r from-[#ffd79f]/[0.02] to-transparent pointer-events-none" />}

      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${statusCfg.bg} border ${statusCfg.border} flex items-center justify-center`}>
              <StatusIcon className={`w-3.5 h-3.5 ${statusCfg.color}`} />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${statusCfg.color}`} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              {statusCfg.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${actionCfg.color}12` }}>
              <ActionIcon className="w-3 h-3" style={{ color: actionCfg.color }} />
            </div>
            <span className="text-[9px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              {actionCfg.label}
            </span>
          </div>
        </div>

        <h3 className="text-white text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>
          {decision.item}
        </h3>

        {details?.reason && (
          <p className="text-[#859399] text-xs leading-relaxed mb-3 line-clamp-2">
            {details.reason}
          </p>
        )}

        {dp != null && dp > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/15 mb-3">
            <TrendingDown className="w-3 h-3 text-[#00d2ff]" />
            <span className="text-[10px] text-[#00d2ff] font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              -{dp}% discount
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <button
            onClick={() => onShowDetails?.(decision)}
            className="flex items-center gap-1.5 text-[10px] text-[#859399] hover:text-white transition-colors"
            style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            View details
            <ArrowRight className="w-3 h-3" />
          </button>

          {isPending && (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onReject?.(decision.id)}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/15 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-all"
                style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
              >
                Reject
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onApprove?.(decision.id)}
                className="px-3 py-1.5 rounded-lg bg-[#1fe19e]/10 border border-[#1fe19e]/15 text-[#1fe19e] text-[10px] font-bold hover:bg-[#1fe19e]/20 transition-all"
                style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
              >
                Approve
              </motion.button>
            </div>
          )}

          {!isPending && decision.decidedAt && (
            <span className="text-[9px] text-[#859399]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              {new Date(decision.decidedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
