'use client';

import { Clock } from 'lucide-react';
import { ACTIVITY_STATUS_CONFIG, MOCK_ACTIVITY } from '@/constants/activity';

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Recent Activity</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Latest events</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {MOCK_ACTIVITY.map((item) => {
            const cfg = ACTIVITY_STATUS_CONFIG[item.status];
            return (
              <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/30 border border-zinc-800 hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors duration-150">
                <div className={`w-9 h-9 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
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
