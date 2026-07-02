'use client';

import { ListChecks, ArrowRight, Zap, CheckCircle2, XCircle, TrendingDown } from 'lucide-react';
import type { RecommendationActionsProps } from '@/types/component-props';

export function RecommendationActions({
  recommendation,
  getDecisionForAction,
  onSelectDecision,
  onApprove,
  onReject,
}: RecommendationActionsProps) {
  if (recommendation.actions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <ListChecks className="w-4 h-4 text-amber-500" />
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-mono">Recommended Actions</p>
        <span className="text-[9px] text-zinc-500 font-mono">· Review & decide</span>
      </div>

      {recommendation.actions.map((action, i) => {
        const decision = getDecisionForAction(action.id);
        const dp = action.details?.discountPercent;
        const decisionStatus = decision?.status;
        const isAuto = decisionStatus === 'auto-approved';
        const isPending = decisionStatus === 'pending';
        const isDecided = decisionStatus === 'approved' || decisionStatus === 'rejected';

        return (
          <div
            key={action.id}
            className={`glass-card rounded-2xl p-4 transition-all duration-150 ${isPending ? 'border-amber-500/20' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isAuto ? 'bg-green-500/10 border border-green-500/20' :
                  isPending ? 'bg-amber-500/10 border border-amber-500/20' :
                    decisionStatus === 'approved' ? 'bg-green-500/10 border border-green-500/20' :
                      decisionStatus === 'rejected' ? 'bg-red-500/10 border border-red-500/20' :
                        'bg-zinc-900 border border-zinc-800'
                }`}>
                {isAuto ? <Zap className="w-4 h-4 text-green-500" /> :
                  decisionStatus === 'approved' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                    decisionStatus === 'rejected' ? <XCircle className="w-4 h-4 text-red-400" /> :
                      <span className="text-[9px] font-bold text-amber-500 font-mono">{i + 1}</span>}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-semibold truncate">{action.item}</p>
                  {dp != null && dp > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e07850]/10 border border-[#e07850]/20">
                      <TrendingDown className="w-2.5 h-2.5 text-[#e07850]" />
                      <span className="text-[9px] text-[#e07850] font-bold font-mono">-{dp}%</span>
                    </span>
                  )}
                </div>
                {action.details?.reason && (
                  <p className="text-zinc-400 text-xs truncate mt-0.5">{action.details.reason}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onSelectDecision(decision ?? null)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-semibold hover:bg-zinc-800 hover:text-white transition-all duration-150 font-mono"
                >
                  Details
                  <ArrowRight className="w-3 h-3" />
                </button>

                {isPending && decision && (
                  <>
                    <button
                      onClick={() => onReject(decision.id, action.item)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-all duration-150 font-mono"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onApprove(decision.id, action.item)}
                      className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold hover:bg-green-500/20 transition-all duration-150 font-mono"
                    >
                      Approve
                    </button>
                  </>
                )}

                {isAuto && (
                  <span className="flex items-center gap-1 px-2 py-1 text-[9px] text-green-500 font-bold font-mono">
                    <Zap className="w-3 h-3" /> Auto
                  </span>
                )}

                {isDecided && (
                  <span className={`text-[9px] font-bold px-2 py-1 ${decisionStatus === 'approved' ? 'text-green-500' : 'text-red-400'} font-mono`}>
                    {decisionStatus === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
