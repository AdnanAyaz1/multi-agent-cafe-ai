'use client';

import { motion } from 'framer-motion';
import { Cloud, Droplets, Wind, Thermometer, AlertTriangle } from 'lucide-react';
import { getImpactLevel, IMPACT_MESSAGES } from '@/utils/weather';
import type { WeatherData } from '@/lib/types';

interface WeatherWidgetProps {
  data: WeatherData;
}

export function WeatherWidget({ data }: WeatherWidgetProps) {
  const impact = getImpactLevel(data.condition);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-3xl overflow-hidden group relative"
    >
      {/* Glow behind */}
      <div className="absolute -inset-8 bg-[#00d2ff]/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10">
        {/* Top gradient strip */}
        <div className="h-1 w-full bg-gradient-to-r from-[#00d2ff] via-[#1fe19e] to-[#00d2ff]" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#1fe19e] flex items-center justify-center shadow-lg shadow-[#00d2ff]/20">
                <Cloud className="w-5 h-5 text-[#003543]" />
              </div>
              <div>
                <p className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Local Weather
                </p>
                <p className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                  {data.city}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-pulse" />
              <span className="text-[10px] text-[#00d2ff] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                LIVE
              </span>
            </div>
          </div>

          {/* Temperature hero */}
          <div className="flex items-baseline gap-3 mb-6">
            <span
              className="text-5xl font-extrabold gradient-text"
              style={{ fontFamily: 'var(--font-montserrat)' }}
            >
              {data.temperature}°C
            </span>
            <span className="text-[#859399] text-sm">{data.condition}</span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: Thermometer, label: 'Feels like', value: `${data.feelsLike}°C` },
              { icon: Droplets, label: 'Humidity', value: `${data.humidity}%` },
              { icon: Wind, label: 'Wind', value: `${data.windSpeed} m/s` },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                <stat.icon className="w-4 h-4 text-[#00d2ff] mx-auto mb-1.5" />
                <p className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  {stat.value}
                </p>
                <p className="text-[9px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Impact banner */}
          <div
            className="p-4 rounded-xl"
            style={{
              background: impact === 'high' ? 'rgba(239,68,68,0.08)' : impact === 'medium' ? 'rgba(255,215,159,0.08)' : 'rgba(31,225,158,0.05)',
              border: `1px solid ${impact === 'high' ? 'rgba(239,68,68,0.15)' : impact === 'medium' ? 'rgba(255,215,159,0.15)' : 'rgba(31,225,158,0.1)'}`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle
                className="w-4 h-4"
                style={{ color: impact === 'high' ? '#ef4444' : impact === 'medium' ? '#ffd79f' : '#1fe19e' }}
              />
              <p className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>
                {impact === 'high' ? 'High' : impact === 'medium' ? 'Moderate' : 'Low'} Business Impact
              </p>
            </div>
            <p className="text-[#859399] text-xs leading-relaxed">
              {IMPACT_MESSAGES[impact]}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
