'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Zap, Clock, History, X, TrendingDown, TrendingUp, Minus, Trash2, Lightbulb } from 'lucide-react';
import type { DecisionLog } from '@/types/decisions';

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  'auto-approved': Zap,
  approved: CheckCircle2,
  rejected: XCircle,
};

const STATUS_COLORS: Record<string, string> = {
  'auto-approved': 'text-[#1fe19e]',
  approved: 'text-[#1fe19e]',
  rejected: 'text-red-400',
};

const ACTION_CONFIG: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  discount: { icon: TrendingDown, color: '#00d2ff', label: 'Discount' },
  promote: { icon: TrendingUp, color: '#1fe19e', label: 'Promote' },
  hold: { icon: Minus, color: '#859399', label: 'Hold' },
  remove: { icon: Trash2, color: '#f87171', label: 'Remove' },
};

interface DecisionHistoryProps {
  logs: DecisionLog[];
}

export function DecisionHistory({ logs }: DecisionHistoryProps) {
  const [selectedLog, setSelectedLog] = useState<DecisionLog | null>(null);

  if (logs.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-12 text-center">
        <div className="relative z-10">
          <History className="w-10 h-10 text-[#859399] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-montserrat)' }}>No history yet</h3>
          <p className="text-[#859399] text-sm">Decisions will appear here once you approve or reject actions.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {logs.map((log, i) => {
          const Icon = STATUS_ICONS[log.status] ?? Clock;
          const color = STATUS_COLORS[log.status] ?? 'text-[#859399]';
          const actionCfg = ACTION_CONFIG[log.action] ?? ACTION_CONFIG.hold;
          const ActionIcon = actionCfg.icon;
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              onClick={() => setSelectedLog(log)}
              className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer group"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                log.status === 'rejected' ? 'bg-red-500/10 border border-red-500/15' : 'bg-[#1fe19e]/10 border border-[#1fe19e]/15'
              }`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-semibold truncate" style={{ fontFamily: 'var(--font-montserrat)' }}>{log.item}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${color}`} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                    {log.status === 'auto-approved' ? 'auto' : log.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[#859399] capitalize" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{log.action}</span>
                  {log.discountPercent != null && log.discountPercent > 0 && (
                    <>
                      <span className="text-[#859399] text-[10px]">·</span>
                      <span className="text-[10px] text-[#00d2ff] font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>-{log.discountPercent}%</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-[9px] text-[#859399]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                  {new Date(log.decidedAt).toLocaleDateString()}
                </p>
                <p className="text-[9px] text-[#859399]/60" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                  {new Date(log.decidedAt).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedLog && (() => {
          const modalActionCfg = ACTION_CONFIG[selectedLog.action] ?? ACTION_CONFIG.hold;
          const ModalActionIcon = modalActionCfg.icon;
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedLog(null)}
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
                  {/* Header */}
                  <div className="p-6 pb-4 border-b border-white/[0.06]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${modalActionCfg.color}15`, border: `1px solid ${modalActionCfg.color}20` }}>
                          <ModalActionIcon className="w-5 h-5" style={{ color: modalActionCfg.color }} />
                        </div>
                        <div>
                          <h2 className="text-white text-lg font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>
                            {selectedLog.item}
                          </h2>
                          <p className="text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)', color: STATUS_COLORS[selectedLog.status] ?? '#859399' }}>
                            {selectedLog.status === 'auto-approved' ? 'Auto-Approved' : selectedLog.status}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedLog(null)} className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#859399] hover:text-white hover:bg-white/[0.06] transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* AI Recommendation Summary */}
                    {selectedLog.summary && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-3.5 h-3.5 text-[#ffd79f]" />
                          <p className="text-[10px] text-[#859399] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>AI Recommendation</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#ffd79f]/[0.04] border border-[#ffd79f]/10">
                          <p className="text-white/90 text-sm leading-relaxed">{selectedLog.summary}</p>
                        </div>
                      </div>
                    )}

                    {/* Action + discount + priority */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                        <span className="text-xs font-semibold text-white capitalize" style={{ fontFamily: 'var(--font-montserrat)' }}>{selectedLog.action}</span>
                      </div>
                      {selectedLog.discountPercent != null && selectedLog.discountPercent > 0 && (
                        <div className="px-3 py-1.5 rounded-lg bg-[#00d2ff]/10 border border-[#00d2ff]/15">
                          <span className="text-xs font-bold text-[#00d2ff]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>-{selectedLog.discountPercent}% off</span>
                        </div>
                      )}
                      {selectedLog.priority != null && (
                        <div className="px-3 py-1.5 rounded-lg bg-[#a78bfa]/10 border border-[#a78bfa]/15">
                          <span className="text-xs font-bold text-[#a78bfa]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Priority {selectedLog.priority}/5</span>
                        </div>
                      )}
                      {selectedLog.confidence && (
                        <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                          <span className="text-xs text-[#859399] capitalize" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{selectedLog.confidence} confidence</span>
                        </div>
                      )}
                    </div>

                    {/* Reasoning */}
                    {selectedLog.reason && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-[#859399] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Why this action?</p>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <p className="text-white/80 text-sm leading-relaxed">{selectedLog.reason}</p>
                        </div>
                      </div>
                    )}

                    {/* Decision outcome */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedLog.status === 'rejected' ? 'bg-red-500/10 border border-red-500/15' :
                        selectedLog.status === 'approved' ? 'bg-[#1fe19e]/10 border border-[#1fe19e]/15' :
                        'bg-[#1fe19e]/10 border border-[#1fe19e]/15'
                      }`}>
                        {selectedLog.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-400" /> :
                         selectedLog.status === 'approved' ? <CheckCircle2 className="w-4 h-4 text-[#1fe19e]" /> :
                         <Zap className="w-4 h-4 text-[#1fe19e]" />}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold capitalize" style={{ fontFamily: 'var(--font-montserrat)' }}>
                          {selectedLog.status === 'auto-approved' ? 'Auto-Approved' : selectedLog.status}
                        </p>
                        <p className="text-[10px] text-[#859399]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                          {new Date(selectedLog.decidedAt).toLocaleDateString()} at {new Date(selectedLog.decidedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 pt-4 border-t border-white/[0.06]">
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-semibold hover:bg-white/[0.06] transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </>
  );
}
