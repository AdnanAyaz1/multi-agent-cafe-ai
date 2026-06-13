import { AGENT_TIMELINE_STEPS } from '@/constants/agent-timeline';
import { Timeline } from '../ui/Timeline';
import type { HomeAgentTimelineProps } from '@/types/dashboard';

export function AgentTimeline({ steps = AGENT_TIMELINE_STEPS, title = 'AI Chain of Thought' }: HomeAgentTimelineProps) {
  return <Timeline title={title} steps={steps} />;
}
