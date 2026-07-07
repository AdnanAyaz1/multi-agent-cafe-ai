import 'server-only';
import { createGroq } from '@ai-sdk/groq';
import type { LanguageModel } from 'ai';
import type { AgentName } from './types';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// llama-3.1-8b-instant: fastest, most free quota (14k req/min on free tier)
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

const PER_AGENT_MODEL: Record<AgentName, string> = {
  'menu-analyst': process.env.MODEL_MENU_ANALYST ?? DEFAULT_MODEL,
  'weather-analyst': process.env.MODEL_WEATHER_ANALYST ?? DEFAULT_MODEL,
  strategist: process.env.MODEL_STRATEGIST ?? DEFAULT_MODEL,
  critic: process.env.MODEL_CRITIC ?? DEFAULT_MODEL,
  synthesizer: process.env.MODEL_SYNTHESIZER ?? DEFAULT_MODEL,
  'competitor-parser': process.env.MODEL_COMPETITOR_PARSER ?? DEFAULT_MODEL,
  'competitor-analyst': process.env.MODEL_COMPETITOR_ANALYST ?? DEFAULT_MODEL,
};

export function getModel(agentName: AgentName): LanguageModel {
  const modelId =
    process.env.GROQ_MODEL_OVERRIDE ?? PER_AGENT_MODEL[agentName];
  return groq(modelId) as unknown as LanguageModel;
}

export const MAX_REVISIONS = parseInt(process.env.MAX_REVISIONS ?? '1', 10);
