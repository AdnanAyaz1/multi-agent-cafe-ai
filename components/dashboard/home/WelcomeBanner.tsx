'use client';

import { Cloud } from 'lucide-react';
import { getGreeting } from '@/utils/greeting';
import type { WelcomeBannerProps } from '@/types/dashboard-home';
import { STATS } from '@/constants/dashboard-home';

export function WelcomeBanner({ weather }: WelcomeBannerProps) {
  return (
    <div className="dash-glass dash-glow rounded-2xl p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-10 bg-zinc-700" />
            <p className="text-[11px] text-[#e07850] uppercase tracking-[0.2em] font-semibold">Dashboard</p>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
            {getGreeting()}, Boss
          </h1>
          <p className="text-zinc-400 text-sm lg:text-base max-w-lg">Your AI agents are analyzing weather, competitors, and your menu to maximize revenue today.</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {weather && (
            <div className="icon-glow flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <Cloud className="w-4 h-4 text-[#e07850]" />
              <div>
                <p className="text-white text-sm font-semibold">{weather.temperature}°C</p>
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider">{weather.condition}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-green-500 font-semibold uppercase tracking-wider">5 agents active</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mt-6 pt-5 border-t border-zinc-800">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2.5">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <div>
              <p className="text-white text-sm font-semibold">{stat.value}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
