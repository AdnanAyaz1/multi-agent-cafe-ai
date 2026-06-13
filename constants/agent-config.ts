import { BarChart3, Cloud, Brain, ShieldCheck, Sparkles } from 'lucide-react';
import type { AgentRole } from './agents';

export const AGENT_ICONS: Record<AgentRole, typeof Brain> = {
  'menu-analyst': BarChart3,
  'weather-analyst': Cloud,
  strategist: Brain,
  critic: ShieldCheck,
  synthesizer: Sparkles,
};

export const AGENT_COLORS: Record<AgentRole, string> = {
  'menu-analyst': 'text-[#e07850]',
  'weather-analyst': 'text-[#c8a070]',
  strategist: 'text-green-500',
  critic: 'text-zinc-400',
  synthesizer: 'text-[#c8a070]',
};

export const AGENT_BG: Record<AgentRole, string> = {
  'menu-analyst': 'bg-[#e07850]/10 border-[#e07850]/20',
  'weather-analyst': 'bg-[#c8a070]/10 border-[#c8a070]/20',
  strategist: 'bg-green-500/10 border-green-500/20',
  critic: 'bg-zinc-400/10 border-zinc-400/20',
  synthesizer: 'bg-[#c8a070]/10 border-[#c8a070]/20',
};
