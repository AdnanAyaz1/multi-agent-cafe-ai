'use client';

import type { StatWidgetProps } from '@/types/dashboard-home';

const ACCENT_MAP = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-500',
    positive: 'text-green-500',
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: 'text-green-500',
    positive: 'text-green-500',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'text-amber-500',
    positive: 'text-green-500',
  },
} as const;

export function StatWidget({ label, value, change, changeType = 'neutral', icon: Icon, accentColor = 'blue' }: StatWidgetProps) {
  const accent = ACCENT_MAP[accentColor] || ACCENT_MAP.blue;
  const changeColor = changeType === 'positive' ? 'text-green-500' : changeType === 'negative' ? 'text-red-400' : 'text-zinc-400';

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] font-semibold mb-2">{label}</p>
          <p className="text-2xl font-bold text-white truncate">{value}</p>
          {change && <p className={`text-xs font-semibold mt-1 ${changeColor}`}>{change}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent.bg} border ${accent.border}`}>
          <Icon className={`w-4.5 h-4.5 ${accent.icon}`} />
        </div>
      </div>
    </div>
  );
}
