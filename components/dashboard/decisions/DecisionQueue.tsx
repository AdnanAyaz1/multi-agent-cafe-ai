'use client';

import { motion } from 'framer-motion';
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-12 text-center relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ background: ['radial-gradient(ellipse at 30% 50%, rgba(31,225,158,0.03) 0%, transparent 60%)', 'radial-gradient(ellipse at 70% 50%, rgba(0,210,255,0.03) 0%, transparent 60%)', 'radial-gradient(ellipse at 30% 50%, rgba(31,225,158,0.03) 0%, transparent 60%)'] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <div className="relative z-10">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-[#1fe19e]/10 border border-[#1fe19e]/15 flex items-center justify-center mx-auto mb-5"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CheckCircle2 className="w-8 h-8 text-[#1fe19e]" />
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>All clear</h3>
          <p className="text-[#859399] text-sm max-w-xs mx-auto">No pending decisions. Run an analysis to get AI recommendations.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#ffd79f]/10 border border-[#ffd79f]/15 flex items-center justify-center">
            <Clock className="w-3 h-3 text-[#ffd79f]" />
          </div>
          <span className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
            {pending.length} pending decision{pending.length !== 1 ? 's' : ''}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBulkApprove}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1fe19e]/10 border border-[#1fe19e]/15 text-[#1fe19e] text-[10px] font-bold hover:bg-[#1fe19e]/20 transition-all"
          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          <Zap className="w-3 h-3" />
          Approve all
        </motion.button>
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
