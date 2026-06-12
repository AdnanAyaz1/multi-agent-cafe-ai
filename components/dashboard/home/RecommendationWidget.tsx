'use client';

import { motion } from 'framer-motion';
import { Megaphone, TrendingUp, Target, DollarSign } from 'lucide-react';
import { MOCK_RECOMMENDATIONS } from '@/constants/recommendations';

export function RecommendationWidget() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }} className="glass-card rounded-3xl overflow-hidden group relative">
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[#ffd79f]/10" />
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffd79f] to-[#f59e0b] flex items-center justify-center shadow-lg shadow-[#ffd79f]/20"><Megaphone className="w-5 h-5 text-[#003543]" /></div>
            <div>
              <p className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>AI Recommendations</p>
              <p className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Today&apos;s top actions</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1fe19e]/10 border border-[#1fe19e]/20">
            <TrendingUp className="w-3 h-3 text-[#1fe19e]" />
            <span className="text-[10px] text-[#1fe19e] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>+39% est.</span>
          </div>
        </div>
        <div className="space-y-2.5">
          {MOCK_RECOMMENDATIONS.map((rec, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${rec.type === 'auto' ? 'bg-[#1fe19e]/10 border border-[#1fe19e]/15' : 'bg-[#00d2ff]/10 border border-[#00d2ff]/15'}`}>
                {rec.type === 'auto' ? <Target className="w-3.5 h-3.5 text-[#1fe19e]" /> : <DollarSign className="w-3.5 h-3.5 text-[#00d2ff]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[13px] font-semibold truncate">{rec.action}</p>
                <p className="text-[#859399] text-[11px] truncate">{rec.reason}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${rec.type === 'auto' ? 'text-[#1fe19e] bg-[#1fe19e]/10' : 'text-[#00d2ff] bg-[#00d2ff]/10'}`} style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{rec.type === 'auto' ? 'AUTO' : 'REVIEW'}</span>
                <span className="text-[9px] text-[#1fe19e] font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{rec.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
