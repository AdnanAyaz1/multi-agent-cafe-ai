import 'server-only';
import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';
import type { AgentName } from './types';

function isValidApiKey(key?: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  return (
    trimmed.length > 0 &&
    !trimmed.startsWith('your-') &&
    trimmed !== 'replace-me' &&
    trimmed !== 'replace-me-with-random-secret'
  );
}

/**
 * Optimal models assigned by role:
 * For Google Gemini free tier, `gemini-2.5-flash` is Google's latest workhorse
 * offering native reasoning/thinking, fast tool execution, and generous free tier quotas.
 * Users can override specific agents via `MODEL_STRATEGIST`, `MODEL_CRITIC`, etc.
 */
const ROLE_MODELS: Record<'google' | 'groq', Record<AgentName, string>> = {
  google: {
    'menu-analyst': 'gemini-2.5-flash',
    'weather-analyst': 'gemini-2.5-flash',
    strategist: 'gemini-2.5-flash',
    critic: 'gemini-2.5-flash',
    synthesizer: 'gemini-2.5-flash',
    'competitor-parser': 'gemini-2.5-flash',
    'competitor-analyst': 'gemini-2.5-flash',
  },
  groq: {
    'menu-analyst': 'llama-3.1-8b-instant',
    'weather-analyst': 'llama-3.1-8b-instant',
    strategist: 'llama-3.3-70b-versatile',
    critic: 'llama-3.3-70b-versatile',
    synthesizer: 'llama-3.3-70b-versatile',
    'competitor-parser': 'llama-3.1-8b-instant',
    'competitor-analyst': 'llama-3.3-70b-versatile',
  },
};

export function getModel(agentName: AgentName): LanguageModel {
  const rawGoogleKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY;
  const rawGroqKey = process.env.GROQ_API_KEY;

  const googleApiKey = isValidApiKey(rawGoogleKey) ? rawGoogleKey!.trim() : undefined;
  const groqApiKey = isValidApiKey(rawGroqKey) ? rawGroqKey!.trim() : undefined;

  const agentEnvKey = `MODEL_${agentName.toUpperCase().replace(/-/g, '_')}`;
  const override = process.env[agentEnvKey] || process.env.AI_MODEL_OVERRIDE;

  if (process.env.MOCK_LLM === 'true' || process.env.AI_PROVIDER === 'mock') {
    return { modelId: 'mock-model', provider: 'mock' } as unknown as LanguageModel;
  }

  // Determine provider: defaults to google if valid key available, otherwise falls back to groq
  const preferredProvider =
    (process.env.AI_PROVIDER?.toLowerCase() as 'google' | 'groq') ||
    (googleApiKey ? 'google' : 'groq');

  if (preferredProvider === 'google' && googleApiKey) {
    const google = createGoogleGenerativeAI({ apiKey: googleApiKey });
    const modelName = override || ROLE_MODELS.google[agentName];
    return google(modelName) as unknown as LanguageModel;
  }

  if (groqApiKey) {
    const groq = createGroq({ apiKey: groqApiKey });
    const modelName = override || ROLE_MODELS.groq[agentName];
    return groq(modelName) as unknown as LanguageModel;
  }

  if (googleApiKey) {
    const google = createGoogleGenerativeAI({ apiKey: googleApiKey });
    const modelName = override || ROLE_MODELS.google[agentName];
    return google(modelName) as unknown as LanguageModel;
  }

  throw new Error(
    'No valid AI provider API key found. Please provide GOOGLE_GENERATIVE_AI_API_KEY (or GOOGLE_AI_API_KEY / GEMINI_API_KEY) or GROQ_API_KEY in your environment.'
  );
}

export const MAX_REVISIONS = parseInt(process.env.MAX_REVISIONS ?? '2', 10);
