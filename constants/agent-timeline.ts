import type { TimelineStepData } from '@/types/dashboard';

export const AGENT_TIMELINE_STEPS: TimelineStepData[] = [
  {
    label: 'Menu Analyst',
    description: 'Identified Hot Chocolate and Iced Latte as high-swing items.',
    status: 'complete',
  },
  {
    label: 'Weather Analyst',
    description: 'Cross-referenced 18°C rainy forecast with historical sales spikes.',
    status: 'complete',
  },
  {
    label: 'Strategist',
    description: 'Running: Optimizing discount percentage for profit margins...',
    status: 'active',
  },
  {
    label: 'Critic',
    description: 'Pending strategic output',
    status: 'pending',
  },
];
