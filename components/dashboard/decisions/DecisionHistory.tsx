'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, Zap, Clock, History, X, TrendingDown, TrendingUp, Minus, Trash2, Lightbulb } from 'lucide-react';
import type { DecisionLog } from '@/types/decisions';

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  'auto-approved': Zap,
  approved: CheckCircle2,
  rejected: XCircle,
};

const STATUS_COLORS: Record<string, string> = {
  'auto-approved': 'text-green-500',
  approved: 'text-green-500',
  rejected: 'text-red-400',
};

const ACTION_CONFIG: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  discount: { icon: TrendingDown, color: 'text-blue-500', label: 'Discount' },
  promote: { icon: TrendingUp, color: 'text-green-500', label: 'Promote' },
  hold: { icon: Minus, color: 'text-zinc-400', label: 'Hold' },
  remove: { icon: Trash2, color: 'text-red-400', label: 'Remove' },
};

interface DecisionHistoryProps {
  logs: DecisionLog[];
}

export function DecisionHistory({ logs }: DecisionHistoryProps) {
  const [selectedLog, setSelectedLog] = useState<DecisionLog | null>(null);

  if (logs.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-12 text-center">
        <div className="relative z-10">
          <History className="w-10 h-10 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No history yet</h3>
          <p className="text-zinc-400 text-sm">Decisions will appear here once you approve or reject actions.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {logs.map((log, i) => {
          const Icon = STATUS_ICONS[log.status] ?? Clock;
          const color = STATUS_COLORS[log.status] ?? 'text-zinc-400';
          const actionCfg = ACTION_CONFIG[log.action] ?? ACTION_CONFIG.hold;
          const ActionIcon = actionCfg.icon;
          return (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-zinc-900 transition-all duration-150 cursor-pointer group"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                log.status === 'rejected' ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'
              }`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-semibold truncate">{log.item}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${color}`}>
                    {log.status === 'auto-approved' ? 'auto' : log.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-zinc-400 capitalize">{log.action}</span>
                  {log.discountPercent != null && log.discountPercent > 0 && (
                    <>
                      <span className="text-zinc-500 text-[10px]">·</span>
                      <span className="text-[10px] text-blue-500 font-bold">-{log.discountPercent}%</span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-[9px] text-zinc-400">
                  {new Date(log.decidedAt).toLocaleDateString()}
                </p>
                <p className="text-[9px] text-zinc-500">
                  {new Date(log.decidedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedLog && (() => {
        const modalActionCfg = ACTION_CONFIG[selectedLog.action] ?? ACTION_CONFIG.hold;
        const ModalActionIcon = modalActionCfg.icon;
        return (
          <>
            <div
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="glass-card rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 pb-4 border-b border-zinc-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${modalActionCfg.color}/10 border border-${modalActionCfg.color === 'text-blue-500' ? 'blue-500' : modalActionCfg.color === 'text-green-500' ? 'green-500' : 'zinc-700'}/20`}>
                        <ModalActionIcon className={`w-5 h-5 ${modalActionCfg.color}`} />
                      </div>
                      <div>
                        <h2 className="text-white text-lg font-bold">
                          {selectedLog.item}
                        </h2>
                        <p className={`text-[10px] uppercase tracking-wider ${STATUS_COLORS[selectedLog.status] ?? 'text-zinc-400'}`}>
                          {selectedLog.status === 'auto-approved' ? 'Auto-Approved' : selectedLog.status}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedLog(null)} className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-150">
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
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">AI Recommendation</p>
                      </div>
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <p className="text-white/90 text-sm leading-relaxed">{selectedLog.summary}</p>
                      </div>
                    </div>
                  )}

                  {/* Action + discount + priority */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      <span className="text-xs font-semibold text-white capitalize">{selectedLog.action}</span>
                    </div>
                    {selectedLog.discountPercent != null && selectedLog.discountPercent > 0 && (
                      <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <span className="text-xs font-bold text-blue-500">-{selectedLog.discountPercent}% off</span>
                      </div>
                    )}
                    {selectedLog.priority != null && (
                      <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <span className="text-xs font-bold text-blue-400">Priority {selectedLog.priority}/5</span>
                      </div>
                    )}
                    {selectedLog.confidence && (
                      <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                        <span className="text-xs text-zinc-400 capitalize">{selectedLog.confidence} confidence</span>
                      </div>
                    )}
                  </div>

                  {/* Reasoning */}
                  {selectedLog.reason && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Why this action?</p>
                      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                        <p className="text-white/80 text-sm leading-relaxed">{selectedLog.reason}</p>
                      </div>
                    </div>
                  )}

                  {/* Decision outcome */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedLog.status === 'rejected' ? 'bg-red-500/10 border border-red-500/20' :
                      selectedLog.status === 'approved' ? 'bg-green-500/10 border border-green-500/20' :
                      'bg-green-500/10 border border-green-500/20'
                    }`}>
                      {selectedLog.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-400" /> :
                       selectedLog.status === 'approved' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                       <Zap className="w-4 h-4 text-green-500" />}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold capitalize">
                        {selectedLog.status === 'auto-approved' ? 'Auto-Approved' : selectedLog.status}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {new Date(selectedLog.decidedAt).toLocaleDateString()} at {new Date(selectedLog.decidedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm font-semibold hover:bg-zinc-800 transition-all duration-150"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </>
  );
}
