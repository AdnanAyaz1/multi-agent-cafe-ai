'use client';

import { Cloud, Droplets, Wind, Thermometer, AlertTriangle, MapPin, Sparkles, Tag, Plus } from 'lucide-react';
import { getImpactLevel, IMPACT_MESSAGES } from '@/utils/weather';
import type { WeatherWidgetProps } from '@/types/dashboard-home';

export function WeatherWidget({
  data,
  cities = [],
  activeCity,
  onCityChange,
  suggestion,
  onOpenOnboarding,
}: WeatherWidgetProps) {
  const impact = getImpactLevel(data.condition);
  const currentCity = activeCity || data.city;

  return (
    <div className="dash-glass dash-glow rounded-2xl overflow-hidden">
      <div className="h-px w-full bg-zinc-700" />

      <div className="p-6 space-y-6">
        {/* Top bar with operational city selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <Cloud className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Branch Weather</p>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{data.city}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e07850]/10 border border-[#e07850]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#e07850]" />
                <span className="text-[10px] text-[#e07850] font-semibold">LIVE</span>
              </div>
            </div>
          </div>

          {/* Operational City Switcher Pills */}
          {cities.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {cities.map((city) => {
                const isActive = city.toLowerCase() === currentCity.toLowerCase();
                return (
                  <button
                    key={city}
                    onClick={() => onCityChange?.(city)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#e07850] text-[#1a1208] shadow-md shadow-[#e07850]/20'
                        : 'bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    {city}
                  </button>
                );
              })}
              {onOpenOnboarding && (
                <button
                  onClick={onOpenOnboarding}
                  title="Configure operational branches"
                  className="px-2.5 py-1 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-dashed border-white/[0.1] text-zinc-400 hover:text-[#e07850] text-xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> City
                </button>
              )}
            </div>
          )}
        </div>

        {/* Temperature & Condition Hero */}
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-bold text-white tracking-tight">
            {data.temperature}°C
          </span>
          <span className="text-zinc-400 text-sm font-medium">{data.condition}</span>
        </div>

        {/* Weather Sub-metrics */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Thermometer, label: 'Feels like', value: `${data.feelsLike}°C` },
            { icon: Droplets, label: 'Humidity', value: `${data.humidity}%` },
            { icon: Wind, label: 'Wind', value: `${data.windSpeed} m/s` },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <stat.icon className="w-4 h-4 text-zinc-400 mx-auto mb-1.5" />
              <p className="text-white text-sm font-bold font-mono">{stat.value}</p>
              <p className="text-[9px] text-zinc-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Dynamic AI Weather Promotion Suggestion */}
        {suggestion ? (
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#e07850]/10 via-transparent to-transparent border border-[#e07850]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {suggestion.headline}
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#e07850]/20 text-[#e07850] uppercase font-mono">
                {suggestion.tag}
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {suggestion.actionableTactic}
            </p>
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
              <span className="text-[#c8a070] font-semibold flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {suggestion.recommendedDiscount}
              </span>
              <span className="text-zinc-500 text-[10px] font-mono">
                {suggestion.suggestedItems.slice(0, 2).join(' · ')}
              </span>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
