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
    model: 'llama-3.1-8b-instant',
    description: 'Categorizes menu items and notes existing prices',
  },
  'weather-analyst': {
    name: 'Weather Analyst',
    model: 'llama-3.1-8b-instant',
    description: 'Summarizes weather and seasonal signals',
  },
  strategist: {
    name: 'Strategist',
    model: 'llama-3.3-70b-versatile',
    description: 'Proposes items to promote or discount with reasoning',
  },
  critic: {
    name: 'Critic',
    model: 'llama-3.3-70b-versatile',
    description: 'Challenges the plan and asks for fixes if needed',
  },
  synthesizer: {
    name: 'Synthesizer',
    model: 'llama-3.1-8b-instant',
    description: 'Produces the final recommendation',
  },
} as const
