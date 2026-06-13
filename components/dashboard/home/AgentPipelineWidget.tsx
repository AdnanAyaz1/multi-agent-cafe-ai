'use client';

import { Brain, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { AGENT_DISPLAY_ORDER, AGENT_CONFIG } from '@/constants/agents';

interface PipelineStep {
  label: string;
  status: 'complete' | 'active' | 'pending' | 'failed';
  description?: string;
}

function StepIcon({ status }: { status: PipelineStep['status'] }) {
  if (status === 'complete') return <div className="w-7 h-7 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-green-500" /></div>;
  if (status === 'active') return <div className="w-7 h-7 rounded-full bg-[#e07850]/10 border border-[#e07850]/20 flex items-center justify-center"><Loader2 className="w-4 h-4 text-[#e07850] animate-spin" /></div>;
  if (status === 'failed') return <div className="w-7 h-7 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center"><AlertCircle className="w-4 h-4 text-red-400" /></div>;
  return <div className="w-7 h-7 rounded-full bg-zinc-800/50 border border-zinc-700 flex items-center justify-center"><Clock className="w-4 h-4 text-zinc-500" /></div>;
}

export function AgentPipelineWidget() {
  const steps: PipelineStep[] = AGENT_DISPLAY_ORDER.map((role) => ({
    label: AGENT_CONFIG[role].name,
    status: role === 'menu-analyst' || role === 'weather-analyst' ? 'complete' : role === 'strategist' ? 'active' : 'pending',
    description: AGENT_CONFIG[role].description,
  }));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#e89070]" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">AI Pipeline</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Chain of thought</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
            <span className="text-[10px] text-amber-500 font-semibold">RUNNING</span>
          </div>
        </div>
        <div className="space-y-1">
          {steps.map((step, i) => (
            <div key={step.label} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-[13px] top-8 w-px h-[calc(100%-8px)] bg-zinc-800" />
              )}
              <div className="flex items-start gap-4 py-3">
                <StepIcon status={step.status} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${step.status === 'pending' ? 'text-zinc-500' : 'text-white'}`}>{step.label}</p>
                  {step.description && <p className="text-[11px] text-zinc-400 mt-0.5">{step.description}</p>}
                </div>
                {step.status === 'complete' && <span className="text-[9px] text-green-500 font-bold px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">DONE</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mt-4 pt-4 border-t border-zinc-800">
          {AGENT_DISPLAY_ORDER.map((role) => (
            <span key={role} className="text-[9px] px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-400 bg-zinc-800/50">{AGENT_CONFIG[role].name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
