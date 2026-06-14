import { AGENT_DISPLAY, AGENT_DISPLAY_ORDER, type AgentRole } from '@/constants/agents';
import { AGENT_ICONS } from '../agent-icons';
import type { AgentTimelineMeta } from '@/types/dashboard';

export const AGENT_TIMELINE_META: Record<AgentRole, AgentTimelineMeta> =
  buildAgentTimelineMeta();

function buildAgentTimelineMeta(): Record<AgentRole, AgentTimelineMeta> {
  const meta = {} as Record<AgentRole, AgentTimelineMeta>;
  for (const role of AGENT_DISPLAY_ORDER) {
    meta[role] = {
      label: AGENT_DISPLAY[role].label,
      description: AGENT_DISPLAY[role].description,
      Icon: AGENT_ICONS[role],
    };
  }
  return meta;
}
