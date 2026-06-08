import { AGENT_TIMELINE_STEPS } from '@/constants/agent-timeline';
import { Timeline } from '../ui/Timeline';

export function AgentTimeline() {
  return <Timeline title="AI Chain of Thought" steps={AGENT_TIMELINE_STEPS} />;
}
