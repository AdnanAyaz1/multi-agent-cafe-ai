'use client';

import { Eye } from 'lucide-react';
import { MOCK_COMPETITORS, COMPETITOR_CHANGE_ICONS } from '@/constants/competitor-display';

export function CompetitorOverview() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Competitor Watch</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Price movements</p>
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">4 competitors</span>
        </div>
        <div className="space-y-2">
          {MOCK_COMPETITORS.map((item) => {
            const cfg = COMPETITOR_CHANGE_ICONS[item.change];
            return (
              <div key={`${item.name}-${item.item}`} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors duration-150">
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
