'use client';

import { motion } from 'framer-motion';
import { Cloud, Zap, TrendingUp } from 'lucide-react';
import { getGreeting } from '@/utils/greeting';
import type { WeatherData } from '@/lib/types';

interface WelcomeBannerProps {
  weather: WeatherData | null;
}

const STATS = [
  { icon: Zap, label: 'Pipeline runs today', value: '3', color: 'text-[#ffd79f]' },
  { icon: TrendingUp, label: 'Revenue impact', value: '+12%', color: 'text-[#1fe19e]' },
  { icon: Cloud, label: 'Weather alerts', value: '1', color: 'text-[#00d2ff]' },
];

export function WelcomeBanner({ weather }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative glass-card rounded-3xl p-8 lg:p-10 overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#00d2ff]/[0.03] via-transparent to-[#1fe19e]/[0.03] pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-[radial-gradient(ellipse,rgba(0,210,255,0.06)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[radial-gradient(ellipse,rgba(31,225,158,0.06)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 gradient-bg" />
            <p className="text-[11px] text-[#00d2ff] uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Dashboard</p>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-2 tracking-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>
            {getGreeting()}, <span className="gradient-text">Boss</span>
          </h1>
          <p className="text-[#859399] text-sm lg:text-base max-w-lg">Your AI agents are analyzing weather, competitors, and your menu to maximize revenue today.</p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {weather && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <Cloud className="w-5 h-5 text-[#00d2ff]" />
              <div>
                <p className="text-white text-sm font-semibold">{weather.temperature}°C</p>
                <p className="text-[#859399] text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{weather.condition}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#1fe19e]/5 border border-[#1fe19e]/15">
            <div className="w-2 h-2 rounded-full bg-[#1fe19e] animate-pulse" />
            <span className="text-[10px] text-[#1fe19e] font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>5 agents active</span>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="relative z-10 flex items-center gap-6 mt-8 pt-6 border-t border-white/[0.06]">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2.5">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <div>
              <p className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>{stat.value}</p>
              <p className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
