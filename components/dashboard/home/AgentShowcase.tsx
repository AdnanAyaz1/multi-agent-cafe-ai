'use client';

import { Cpu, Zap } from 'lucide-react';
import { AGENT_CONFIG, AGENT_ROLES } from '@/constants/agents';
import { AGENT_ICONS, AGENT_COLORS, AGENT_BG } from '@/constants/agent-config';

export function AgentShowcase() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px w-12 bg-zinc-700" />
        <p className="text-xs text-zinc-400 uppercase tracking-widest font-medium">Your AI Agents</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {AGENT_ROLES.map((role) => {
          const config = AGENT_CONFIG[role];
          const Icon = AGENT_ICONS[role];
          return (
            <div key={role} className="glass-card rounded-xl p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 border ${AGENT_BG[role]}`}>
                <Icon className={`w-5 h-5 ${AGENT_COLORS[role]}`} />
              </div>
              <p className="text-white text-sm font-semibold mb-1">{config.name}</p>
              <p className="text-zinc-400 text-xs leading-relaxed">{config.description}</p>
              <div className="mt-3 flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{config.model}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center mt-6 gap-3">
        <div className="h-px flex-1 bg-zinc-800" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">5 agents chained in sequence</span>
        </div>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>
    </div>
  );
}
