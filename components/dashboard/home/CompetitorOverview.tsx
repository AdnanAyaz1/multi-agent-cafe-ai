'use client';

import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { MOCK_COMPETITORS, COMPETITOR_CHANGE_ICONS } from '@/constants/competitor-display';

export function CompetitorOverview() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }} className="glass-card rounded-3xl overflow-hidden group relative">
      <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[#00d2ff]/5" />
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#818cf8] flex items-center justify-center shadow-lg shadow-[#00d2ff]/20"><Eye className="w-5 h-5 text-[#003543]" /></div>
            <div>
              <p className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>Competitor Watch</p>
              <p className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Price movements</p>
            </div>
          </div>
          <span className="text-[10px] text-[#859399]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>4 competitors</span>
        </div>
        <div className="space-y-2">
          {MOCK_COMPETITORS.map((item) => {
            const cfg = COMPETITOR_CHANGE_ICONS[item.change];
            return (
              <div key={`${item.name}-${item.item}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}><cfg.icon className={`w-4 h-4 ${cfg.color}`} /></div>
                <div className="flex-1 min-w-0"><p className="text-white text-[13px] font-semibold truncate">{item.name} — {item.item}</p></div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>{item.price}</p>
                  <p className={`text-[9px] font-bold ${cfg.color}`} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{item.changeAmount}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
