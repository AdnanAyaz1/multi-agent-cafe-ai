'use client';

import { Cloud, Droplets, Wind, Thermometer, AlertTriangle } from 'lucide-react';
import { getImpactLevel, IMPACT_MESSAGES } from '@/utils/weather';
import type { WeatherData } from '@/lib/types';

interface WeatherWidgetProps {
  data: WeatherData;
}

export function WeatherWidget({ data }: WeatherWidgetProps) {
  const impact = getImpactLevel(data.condition);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="h-px w-full bg-zinc-700" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Local Weather</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{data.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] text-blue-500 font-semibold">LIVE</span>
          </div>
        </div>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-5xl font-bold text-white">
            {data.temperature}°C
          </span>
          <span className="text-zinc-400 text-sm">{data.condition}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: Thermometer, label: 'Feels like', value: `${data.feelsLike}°C` },
            { icon: Droplets, label: 'Humidity', value: `${data.humidity}%` },
            { icon: Wind, label: 'Wind', value: `${data.windSpeed} m/s` },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 text-center">
              <stat.icon className="w-4 h-4 text-blue-500 mx-auto mb-1.5" />
              <p className="text-white text-sm font-semibold font-mono">{stat.value}</p>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            background: impact === 'high' ? 'rgba(239,68,68,0.08)' : impact === 'medium' ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.05)',
            border: `1px solid ${impact === 'high' ? 'rgba(239,68,68,0.15)' : impact === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.1)'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle
              className="w-4 h-4"
              style={{ color: impact === 'high' ? '#ef4444' : impact === 'medium' ? '#f59e0b' : '#22c55e' }}
            />
            <p className="text-white text-sm font-bold">
              {impact === 'high' ? 'High' : impact === 'medium' ? 'Moderate' : 'Low'} Business Impact
            </p>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            {IMPACT_MESSAGES[impact]}
          </p>
        </div>
      </div>
    </div>
  );
}
