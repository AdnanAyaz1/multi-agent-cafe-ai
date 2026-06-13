'use client';

import { Megaphone, TrendingUp, Target, DollarSign } from 'lucide-react';
import { MOCK_RECOMMENDATIONS } from '@/constants/recommendations';

export function RecommendationWidget() {
  return (
    <div className="dash-glass dash-featured dash-glow dash-shimmer rounded-2xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="icon-glow w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">AI Recommendations</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Today&apos;s top actions</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-[10px] text-green-500 font-semibold">+39% est.</span>
          </div>
        </div>
        <div className="space-y-2">
          {MOCK_RECOMMENDATIONS.map((rec, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${rec.type === 'auto' ? 'bg-green-500/10 border border-green-500/20' : 'bg-[#e07850]/10 border border-[#e07850]/20'}`}>
                {rec.type === 'auto' ? <Target className="w-3.5 h-3.5 text-green-500" /> : <DollarSign className="w-3.5 h-3.5 text-[#e07850]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-semibold truncate">{rec.action}</p>
                <p className="text-zinc-400 text-[11px] truncate">{rec.reason}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${rec.type === 'auto' ? 'text-green-500 bg-green-500/10' : 'text-[#e07850] bg-[#e07850]/10'}`}>{rec.type === 'auto' ? 'AUTO' : 'REVIEW'}</span>
                <span className="text-[9px] text-green-500 font-bold">{rec.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
