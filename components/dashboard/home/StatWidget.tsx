'use client';

import { motion } from 'framer-motion';
import type { StatWidgetProps } from '@/types/dashboard-home';

export function StatWidget({ label, value, change, changeType = 'neutral', icon: Icon, iconGradient, index = 0 }: StatWidgetProps) {
  const changeColor = changeType === 'positive' ? 'text-[#1fe19e]' : changeType === 'negative' ? 'text-red-400' : 'text-[#859399]';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }} className="glass-card rounded-2xl p-6 group relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `${iconGradient}20` }} />
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[#859399] uppercase tracking-[0.15em] font-semibold mb-2" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{label}</p>
          <p className="text-2xl font-extrabold text-white truncate" style={{ fontFamily: 'var(--font-montserrat)' }}>{value}</p>
          {change && <p className={`text-xs font-semibold mt-1 ${changeColor}`} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{change}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${iconGradient}15`, border: `1px solid ${iconGradient}20` }}>
          <Icon className="w-5 h-5" style={{ color: iconGradient }} />
        </div>
      </div>
    </motion.div>
  );
}
