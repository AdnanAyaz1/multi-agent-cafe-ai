import {
  ClipboardList,
  Cloud,
  Lightbulb,
  type LucideIcon,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { AGENT_ROLES, type AgentRole } from '@/constants/agents';

export const AGENT_ICONS: Record<AgentRole, LucideIcon> = {
  'menu-analyst': ClipboardList,
  'weather-analyst': Cloud,
  strategist: Lightbulb,
  critic: TriangleAlert,
  synthesizer: Sparkles,
};

export function getAgentIcon(role: AgentRole): LucideIcon {
  return AGENT_ICONS[role] ?? Sparkles;
}

export const AGENT_ICON_LIST: ReadonlyArray<{ role: AgentRole; Icon: LucideIcon }> =
  AGENT_ROLES.map((role) => ({ role, Icon: AGENT_ICONS[role] }));
