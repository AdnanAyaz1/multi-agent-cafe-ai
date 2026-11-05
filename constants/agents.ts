export const AGENT_ROLES = [
  'menu-analyst',
  'weather-analyst',
  'strategist',
  'critic',
  'synthesizer',
] as const

export type AgentRole = (typeof AGENT_ROLES)[number]

export const AGENT_CONFIG = {
  'menu-analyst': {
    name: 'Menu Analyst',
    model: 'openai/gpt-oss-20b',
    description: 'Categorizes menu items and notes existing prices',
  },
  'weather-analyst': {
    name: 'Weather Analyst',
    model: 'openai/gpt-oss-20b',
    description: 'Summarizes weather and seasonal signals',
  },
  strategist: {
    name: 'Strategist',
    model: 'openai/gpt-oss-20b',
    description: 'Proposes items to promote or discount with reasoning',
  },
  critic: {
    name: 'Critic',
    model: 'openai/gpt-oss-20b',
    description: 'Challenges the plan and asks for fixes if needed',
  },
  synthesizer: {
    name: 'Synthesizer',
    model: 'openai/gpt-oss-20b',
    description: 'Produces the final recommendation',
  },
} as const

export const AGENT_DISPLAY: Record<AgentRole, { label: string; description: string }> = {
  'menu-analyst': {
    label: AGENT_CONFIG['menu-analyst'].name,
    description: 'Inventory & menu mix',
  },
  'weather-analyst': {
    label: AGENT_CONFIG['weather-analyst'].name,
    description: 'Conditions impact',
  },
  strategist: {
    label: AGENT_CONFIG.strategist.name,
    description: 'Opportunity mapping',
  },
  critic: {
    label: AGENT_CONFIG.critic.name,
    description: 'Risk review',
  },
  synthesizer: {
    label: AGENT_CONFIG.synthesizer.name,
    description: 'Final recommendation',
  },
}

export const AGENT_DISPLAY_ORDER: readonly AgentRole[] = AGENT_ROLES
