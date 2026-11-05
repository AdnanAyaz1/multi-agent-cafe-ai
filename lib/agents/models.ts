import 'server-only';
import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';
import type { AgentName } from './types';

export type AIProvider = 'google' | 'groq' | 'hybrid' | 'mock';

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
 * Standard models:
 * - Groq: `openai/gpt-oss-20b` (The most generous free-tier model: ~1,000 tps, high RPM/TPM limits, minimal token footprint)
 * - Google Gemini: `gemini-3.8-flash` / `gemini-3.5-flash-lite`
 */
export const ROLE_MODELS: Record<'google' | 'groq', Record<AgentName, string>> = {
  groq: {
    'menu-analyst': 'openai/gpt-oss-20b',
    'weather-analyst': 'openai/gpt-oss-20b',
    strategist: 'openai/gpt-oss-20b',
    critic: 'openai/gpt-oss-20b',
    synthesizer: 'openai/gpt-oss-20b',
    'competitor-parser': 'openai/gpt-oss-20b',
    'competitor-analyst': 'openai/gpt-oss-20b',
  },
  google: {
    'menu-analyst': 'gemini-3.5-flash-lite',
    'weather-analyst': 'gemini-3.5-flash-lite',
    strategist: 'gemini-3.8-flash',
    critic: 'gemini-3.8-flash',
    synthesizer: 'gemini-3.8-flash',
    'competitor-parser': 'gemini-3.5-flash-lite',
    'competitor-analyst': 'gemini-3.8-flash',
  },
};

/**
 * All-Groq High-Throughput Configuration:
 * Routes all agents through Groq's most generous model (`openai/gpt-oss-20b`)
 * to eliminate rate limit collisions and maximize request throughput.
 */
export const HYBRID_ROLE_ASSIGNMENTS: Record<
  AgentName,
  { provider: 'google' | 'groq'; model: string }
> = {
  'menu-analyst': { provider: 'groq', model: 'openai/gpt-oss-20b' },
  'weather-analyst': { provider: 'groq', model: 'openai/gpt-oss-20b' },
  'competitor-parser': { provider: 'groq', model: 'openai/gpt-oss-20b' },
  strategist: { provider: 'groq', model: 'openai/gpt-oss-20b' },
  critic: { provider: 'groq', model: 'openai/gpt-oss-20b' },
  'competitor-analyst': { provider: 'groq', model: 'openai/gpt-oss-20b' },
  synthesizer: { provider: 'groq', model: 'openai/gpt-oss-20b' },
};

function getApiKeys(): { googleApiKey?: string; groqApiKey?: string } {
  const rawGoogleKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY;
  const rawGroqKey = process.env.GROQ_API_KEY;

  const googleApiKey = isValidApiKey(rawGoogleKey) ? rawGoogleKey!.trim() : undefined;
  const groqApiKey = isValidApiKey(rawGroqKey) ? rawGroqKey!.trim() : undefined;

  return { googleApiKey, groqApiKey };
}

/**
 * Resolves active provider strategy:
 * - If MOCK_LLM='true' -> 'mock'
 * - If AI_PROVIDER explicitly set ('groq' | 'google' | 'hybrid') -> respects it
 * - Defaults to 'groq' if GROQ_API_KEY is available for most generous limits
 * - Otherwise falls back to 'google'
 */
export function resolveProvider(preferred?: string): AIProvider {
  if (process.env.MOCK_LLM === 'true' || process.env.AI_PROVIDER === 'mock') {
    return 'mock';
  }

  const { googleApiKey, groqApiKey } = getApiKeys();
  const explicit = (preferred || process.env.AI_PROVIDER)?.toLowerCase();

  if (explicit === 'groq' || explicit === 'google' || explicit === 'hybrid') {
    return explicit as AIProvider;
  }

  // Default to Groq when key is provided for maximum rate-limit generosity
  if (groqApiKey) return 'groq';
  if (googleApiKey) return 'google';

  return 'groq';
}

function createModelInstance(provider: 'google' | 'groq', modelName: string): LanguageModel {
  const { googleApiKey, groqApiKey } = getApiKeys();

  if (provider === 'groq') {
    if (!groqApiKey) {
      throw new Error('Groq API key required but not found in GROQ_API_KEY.');
    }
    const groq = createGroq({ apiKey: groqApiKey });
    return groq(modelName) as unknown as LanguageModel;
  }

  if (!googleApiKey) {
    throw new Error(
      'Google Gemini API key required but not found in GOOGLE_GENERATIVE_AI_API_KEY / GEMINI_API_KEY.'
    );
  }
  const google = createGoogleGenerativeAI({ apiKey: googleApiKey });
  return google(modelName) as unknown as LanguageModel;
}

export function getModel(agentName: AgentName): LanguageModel {
  if (process.env.MOCK_LLM === 'true' || process.env.AI_PROVIDER === 'mock') {
    return { modelId: 'mock-model', provider: 'mock' } as unknown as LanguageModel;
  }

  const { googleApiKey, groqApiKey } = getApiKeys();
  if (!googleApiKey && !groqApiKey) {
    throw new Error(
      'No valid AI provider API key found. Please provide GROQ_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY) in your environment.'
    );
  }

  const agentEnvKey = `MODEL_${agentName.toUpperCase().replace(/-/g, '_')}`;
  const override =
    process.env[agentEnvKey] ||
    process.env.AI_MODEL_OVERRIDE ||
    process.env.GROQ_MODEL;

  const provider = resolveProvider();

  if (provider === 'groq' && groqApiKey) {
    return createModelInstance('groq', override || ROLE_MODELS.groq[agentName]);
  }

  if (provider === 'hybrid') {
    const target = HYBRID_ROLE_ASSIGNMENTS[agentName];
    if (target.provider === 'groq' && groqApiKey) {
      return createModelInstance('groq', override || target.model);
    }
    if (target.provider === 'google' && googleApiKey) {
      return createModelInstance('google', override || target.model);
    }
    if (groqApiKey) return createModelInstance('groq', override || ROLE_MODELS.groq[agentName]);
    if (googleApiKey) return createModelInstance('google', override || ROLE_MODELS.google[agentName]);
  }

  if (provider === 'google' && googleApiKey) {
    return createModelInstance('google', override || ROLE_MODELS.google[agentName]);
  }

  // Graceful fallback to whichever key exists
  if (groqApiKey) return createModelInstance('groq', override || ROLE_MODELS.groq[agentName]);
  if (googleApiKey) return createModelInstance('google', override || ROLE_MODELS.google[agentName]);

  throw new Error('No valid AI provider API key found.');
}

/**
 * Returns an alternative fallback model (on Google if available, or alternate Groq model)
 * to ensure that transient provider limits or network timeouts fail over cleanly.
 */
export function getFallbackModel(agentName: AgentName): LanguageModel | undefined {
  if (process.env.MOCK_LLM === 'true' || process.env.AI_PROVIDER === 'mock') {
    return undefined;
  }

  const { googleApiKey, groqApiKey } = getApiKeys();

  // If Google key is provisioned, use it as fallback provider
  if (googleApiKey) {
    return createModelInstance('google', ROLE_MODELS.google[agentName]);
  }

  // If only Groq key is present, fallback to Groq 70b
  if (groqApiKey) {
    const currentModel = ROLE_MODELS.groq[agentName];
    const altModel = currentModel === 'openai/gpt-oss-20b' ? 'llama-3.3-70b-versatile' : 'openai/gpt-oss-20b';
    return createModelInstance('groq', altModel);
  }

  return undefined;
}

export const MAX_REVISIONS = parseInt(process.env.MAX_REVISIONS ?? '2', 10);
