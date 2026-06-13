'use client';

import { ACCENT_MAP } from '@/constants/dashboard-home';
import type { StatWidgetProps } from '@/types/dashboard-home';

export function StatWidget({ label, value, change, changeType = 'neutral', icon: Icon, accentColor = 'blue' }: StatWidgetProps) {
  const accent = ACCENT_MAP[accentColor] || ACCENT_MAP.blue;
  const changeColor = changeType === 'positive' ? 'text-green-500' : changeType === 'negative' ? 'text-red-400' : 'text-zinc-400';

  return (
    <div className="dash-glass dash-glow dash-shimmer rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] font-semibold mb-2">{label}</p>
          <p className="text-2xl font-bold text-white truncate">{value}</p>
          {change && <p className={`text-xs font-semibold mt-1 ${changeColor}`}>{change}</p>}
        </div>
        <div className={`icon-glow w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent.bg} border ${accent.border}`}>
          <Icon className={`w-4.5 h-4.5 ${accent.icon}`} />
        </div>
      </div>
    </div>
  );
}
