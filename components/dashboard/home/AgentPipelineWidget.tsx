'use client';

import { motion } from 'framer-motion';
import { Brain, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { AGENT_DISPLAY_ORDER, AGENT_CONFIG } from '@/constants/agents';

interface PipelineStep {
  label: string;
  status: 'complete' | 'active' | 'pending' | 'failed';
  description?: string;
}

function StepIcon({ status }: { status: PipelineStep['status'] }) {
  if (status === 'complete') return <div className="w-7 h-7 rounded-full bg-[#1fe19e]/15 border border-[#1fe19e]/25 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-[#1fe19e]" /></div>;
  if (status === 'active') return <div className="w-7 h-7 rounded-full bg-[#00d2ff]/15 border border-[#00d2ff]/25 flex items-center justify-center animate-pulse"><Loader2 className="w-4 h-4 text-[#00d2ff] animate-spin" /></div>;
  if (status === 'failed') return <div className="w-7 h-7 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-red-400" /></div>;
  return <div className="w-7 h-7 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center"><Clock className="w-4 h-4 text-[#859399]/40" /></div>;
}

export function AgentPipelineWidget() {
  const steps: PipelineStep[] = AGENT_DISPLAY_ORDER.map((role) => ({
    label: AGENT_CONFIG[role].name,
    status: role === 'menu-analyst' || role === 'weather-analyst' ? 'complete' : role === 'strategist' ? 'active' : 'pending',
    description: AGENT_CONFIG[role].description,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} className="glass-card rounded-3xl overflow-hidden group relative">
      <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[#a78bfa]/10" />
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a78bfa] to-[#818cf8] flex items-center justify-center shadow-lg shadow-[#a78bfa]/20"><Brain className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>AI Pipeline</p>
              <p className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Chain of thought</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffd79f]/10 border border-[#ffd79f]/20">
            <Loader2 className="w-3 h-3 text-[#ffd79f] animate-spin" />
            <span className="text-[10px] text-[#ffd79f] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>RUNNING</span>
          </div>
        </div>
        <div className="space-y-1">
          {steps.map((step, i) => (
            <div key={step.label} className="relative">
              {i < steps.length - 1 && <div className="absolute left-[13px] top-8 w-px h-[calc(100%-8px)]" style={{ background: step.status === 'complete' ? 'linear-gradient(to bottom, #1fe19e40, #1fe19e20)' : 'rgba(255,255,255,0.04)' }} />}
              <div className="flex items-start gap-4 py-3">
                <StepIcon status={step.status} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${step.status === 'pending' ? 'text-[#859399]/50' : 'text-white'}`} style={{ fontFamily: 'var(--font-montserrat)' }}>{step.label}</p>
                  {step.description && <p className="text-[11px] text-[#859399] mt-0.5">{step.description}</p>}
                </div>
                {step.status === 'complete' && <span className="text-[9px] text-[#1fe19e] font-bold px-2 py-0.5 rounded-full bg-[#1fe19e]/10 border border-[#1fe19e]/15" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>DONE</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mt-4 pt-4 border-t border-white/[0.06]">
          {AGENT_DISPLAY_ORDER.map((role) => (
            <span key={role} className="text-[9px] px-2.5 py-1 rounded-full border border-white/[0.08] text-[#859399] bg-white/[0.02]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{AGENT_CONFIG[role].name}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
