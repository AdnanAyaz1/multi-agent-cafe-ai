import 'server-only';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';
import type { AgentName } from './types';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

const DEFAULT_MODEL = 'gemini-2.5-flash';

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
    process.env.GOOGLE_MODEL_OVERRIDE ?? PER_AGENT_MODEL[agentName];
  return google(modelId) as unknown as LanguageModel;
}

export const MAX_REVISIONS = parseInt(process.env.MAX_REVISIONS ?? '1', 10);
