'use client';

import { Eye } from 'lucide-react';
import { MOCK_COMPETITORS, COMPETITOR_CHANGE_ICONS } from '@/constants/competitor-display';

export function CompetitorOverview() {
  return (
    <div className="dash-glass dash-glow rounded-2xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <Eye className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Competitor Watch</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Price movements</p>
            </div>
          </div>
          <span className="text-[10px] text-zinc-500">4 competitors</span>
        </div>
        <div className="space-y-2">
          {MOCK_COMPETITORS.map((item) => {
            const cfg = COMPETITOR_CHANGE_ICONS[item.change];
            return (
              <div key={`${item.name}-${item.item}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[13px] font-semibold truncate">{item.name} — {item.item}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-semibold font-mono">{item.price}</p>
                  <p className={`text-[9px] font-bold ${cfg.color} font-mono`}>{item.changeAmount}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
