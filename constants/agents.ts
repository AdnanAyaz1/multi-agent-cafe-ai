/**
 * Canonical list of agent names. Includes every agent in the pipeline
 * (orchestrator + competitor pipeline). Single source of truth.
 */
export const AGENT_NAMES = [
  'menu-analyst',
  'weather-analyst',
  'strategist',
  'critic',
  'synthesizer',
  'competitor-parser',
] as const;

export type AgentName = (typeof AGENT_NAMES)[number];
