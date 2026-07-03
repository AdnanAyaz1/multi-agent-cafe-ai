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
          <p className="text-[11px] text-zinc-400 uppercase tracking-[0.15em] font-semibold mb-2">{label}</p>
          <p className="text-3xl font-extrabold text-white truncate tracking-tight">{value}</p>
          {change && <p className={`text-xs font-semibold mt-1.5 ${changeColor}`}>{change}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent.bg} border ${accent.border}`}>
          <Icon className={`w-4 h-4 ${accent.icon}`} />
        </div>
      </div>
    </div>
  );
}
