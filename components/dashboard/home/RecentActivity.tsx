'use client';

import { Clock } from 'lucide-react';
import { ACTIVITY_STATUS_CONFIG, MOCK_ACTIVITY } from '@/constants/activity';

export function RecentActivity() {
  return (
    <div className="dash-glass dash-glow rounded-2xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <Clock className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Recent Activity</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Latest events</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {MOCK_ACTIVITY.map((item) => {
            const cfg = ACTIVITY_STATUS_CONFIG[item.status];
            return (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                  <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                  <p className="text-zinc-400 text-xs truncate">{item.description}</p>
                </div>
                <span className="text-[9px] text-zinc-500 flex-shrink-0">{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
