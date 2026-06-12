'use client';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { ACTIVITY_STATUS_CONFIG, MOCK_ACTIVITY } from '@/constants/activity';

export function RecentActivity() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="glass-card rounded-3xl overflow-hidden group relative">
      <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[#1fe19e]/5" />
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1fe19e] to-[#00d2ff] flex items-center justify-center shadow-lg shadow-[#1fe19e]/20"><Clock className="w-5 h-5 text-[#003543]" /></div>
            <div>
              <p className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>Recent Activity</p>
              <p className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Latest events</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {MOCK_ACTIVITY.map((item) => {
            const cfg = ACTIVITY_STATUS_CONFIG[item.status];
            return (
              <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
                <div className={`w-9 h-9 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}><cfg.icon className={`w-4 h-4 ${cfg.color}`} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate" style={{ fontFamily: 'var(--font-montserrat)' }}>{item.title}</p>
                  <p className="text-[#859399] text-xs truncate">{item.description}</p>
                </div>
                <span className="text-[9px] text-[#859399] flex-shrink-0" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
