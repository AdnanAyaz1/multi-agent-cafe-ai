'use client';

import { motion } from 'framer-motion';
import { BarChart3, Cloud, Brain, ShieldCheck, Sparkles, Cpu, Zap } from 'lucide-react';
import { AGENT_CONFIG, AGENT_ROLES } from '@/constants/agents';
import { AGENT_COLORS } from '@/constants/pipeline-display';

const AGENT_ICONS: Record<string, typeof Brain> = {
  'menu-analyst': BarChart3,
  'weather-analyst': Cloud,
  strategist: Brain,
  critic: ShieldCheck,
  synthesizer: Sparkles,
};

export function AgentShowcase() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-12 bg-gradient-to-r from-[#a78bfa] to-transparent" />
        <p className="text-[11px] text-[#a78bfa] uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Your AI Agents</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {AGENT_ROLES.map((role, i) => {
          const config = AGENT_CONFIG[role];
          const Icon = AGENT_ICONS[role];
          const color = AGENT_COLORS[role];
          return (
            <motion.div key={role} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }} className="glass-card rounded-2xl p-5 group relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `${color}15` }} />
              <div className="relative z-10">
                <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: `${color}15`, border: `1px solid ${color}20`, boxShadow: `0 4px 15px ${color}10` }} whileHover={{ scale: 1.1, rotate: 5 }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </motion.div>
                <p className="text-white text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>{config.name}</p>
                <p className="text-[#859399] text-[11px] leading-relaxed">{config.description}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-[#859399]/50" />
                  <span className="text-[9px] text-[#859399]/50 uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{config.model}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center justify-center mt-6 gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
          <Zap className="w-3.5 h-3.5 text-[#ffd79f]" />
          <span className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>5 agents chained in sequence</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>
    </motion.div>
  );
}
