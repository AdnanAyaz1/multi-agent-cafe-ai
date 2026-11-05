import 'server-only';
import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';
import type { AgentName } from './types';

export type AIProvider = 'google' | 'groq' | 'hybrid' | 'mock';

/**
 * Migration map for deprecated or decommissioned models.
 * Ensures that stale environment variables or legacy configs never trigger
 * "model does not exist" or "model is no longer available" errors.
 */
const DEPRECATED_MODELS: Record<string, string> = {
  'llama-3.1-8b-instant': 'openai/gpt-oss-20b',
  'llama-3.1-70b-versatile': 'llama-3.3-70b-versatile',
  'gemini-2.0-flash': 'gemini-3.8-flash',
  'gemini-2.0-flash-exp': 'gemini-3.8-flash',
  'gemini-1.5-flash': 'gemini-3.5-flash-lite',
  'gemini-1.5-pro': 'gemini-3.8-flash',
};

export function sanitizeModelName(rawModelName: string, provider?: 'google' | 'groq'): string {
  const trimmed = rawModelName.trim();
  if (DEPRECATED_MODELS[trimmed]) {
    return DEPRECATED_MODELS[trimmed];
  }
  if (trimmed.includes('llama-3.1-8b')) {
    return 'openai/gpt-oss-20b';
  }
  if (trimmed.includes('llama-3.1-70b')) {
    return 'llama-3.3-70b-versatile';
  }
  if (trimmed.includes('gemini-2.0') || trimmed.includes('gemini-1.5')) {
    return 'gemini-3.8-flash';
  }
  return trimmed;
}

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
 * Distinct Model Per Operation (Multi-Provider, Multi-Agent Architecture):
 * Every operation runs on its own dedicated model. No two operations share a model.
 *
 * 1. menu-analyst:        Groq    openai/gpt-oss-20b        (High-speed JSON classification & margin mix)
 * 2. weather-analyst:     Google  gemini-3.5-flash-lite     (Lightweight real-time weather & seasonal signals)
 * 3. competitor-parser:   Google  gemini-3.1-flash-lite     (High-speed structured competitor feed parser)
 * 4. competitor-analyst:  Google  gemini-3.6-flash          (Deep competitor positioning & benchmark matrix)
 * 5. strategist:          Google  gemini-3.8-flash          (Flagship Google model for pricing formulas & promotions)
 * 6. critic:              Groq    llama-3.3-70b-versatile   (Meta Llama 3.3 70B for independent cross-family audit)
 * 7. synthesizer:         Groq    openai/gpt-oss-120b       (Deep reasoning model for daily executive briefing)
 */
export const HYBRID_ROLE_ASSIGNMENTS: Record<
  AgentName,
  { provider: 'google' | 'groq'; model: string }
> = {
  'menu-analyst': { provider: 'groq', model: 'openai/gpt-oss-20b' },
  'weather-analyst': { provider: 'google', model: 'gemini-3.5-flash-lite' },
  'competitor-parser': { provider: 'google', model: 'gemini-3.1-flash-lite' },
  'competitor-analyst': { provider: 'google', model: 'gemini-3.6-flash' },
  strategist: { provider: 'google', model: 'gemini-3.8-flash' },
  critic: { provider: 'groq', model: 'llama-3.3-70b-versatile' },
  synthesizer: { provider: 'groq', model: 'openai/gpt-oss-120b' },
};

export const FALLBACK_ROLE_ASSIGNMENTS: Record<
  AgentName,
  { provider: 'google' | 'groq'; model: string }
> = {
  'menu-analyst': { provider: 'google', model: 'gemini-3.5-flash-lite' },
  'weather-analyst': { provider: 'groq', model: 'openai/gpt-oss-20b' },
  'competitor-parser': { provider: 'groq', model: 'openai/gpt-oss-20b' },
  'competitor-analyst': { provider: 'groq', model: 'llama-3.3-70b-versatile' },
  strategist: { provider: 'groq', model: 'openai/gpt-oss-120b' },
  critic: { provider: 'google', model: 'gemini-3.8-flash' },
  synthesizer: { provider: 'google', model: 'gemini-3.6-flash' },
};

export const ROLE_MODELS: Record<'google' | 'groq', Record<AgentName, string>> = {
  groq: {
    'menu-analyst': 'openai/gpt-oss-20b',
    'weather-analyst': 'qwen/qwen3.8-27b',
    'competitor-parser': 'openai/gpt-oss-safeguard-20b',
    'competitor-analyst': 'llama-3.3-70b-versatile',
    strategist: 'openai/gpt-oss-120b',
    critic: 'llama-3.3-70b-versatile',
    synthesizer: 'openai/gpt-oss-120b',
  },
  google: {
    'menu-analyst': 'gemini-3.5-flash-lite',
    'weather-analyst': 'gemini-3.1-flash-lite',
    'competitor-parser': 'gemini-3.5-flash-lite',
    'competitor-analyst': 'gemini-3.6-flash',
    strategist: 'gemini-3.8-flash',
    critic: 'gemini-3.8-flash',
    synthesizer: 'gemini-3.6-flash',
  },
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
 * - If AI_PROVIDER explicitly set ('hybrid' | 'groq' | 'google') -> respects it
 * - Defaults to 'hybrid' whenever both Google and Groq keys are available
 *   so that every operation runs on its own unique model.
 * - Otherwise falls back to whichever provider key is configured.
 */
export function resolveProvider(preferred?: string): AIProvider {
  if (process.env.MOCK_LLM === 'true' || process.env.AI_PROVIDER === 'mock') {
    return 'mock';
  }

  const { googleApiKey, groqApiKey } = getApiKeys();
  const explicit = (preferred || process.env.AI_PROVIDER)?.toLowerCase();

  if (explicit === 'hybrid' || explicit === 'groq' || explicit === 'google') {
    return explicit as AIProvider;
  }

  // When both keys are configured, hybrid guarantees each operation gets a distinct model
  if (googleApiKey && groqApiKey) {
    return 'hybrid';
  }

  if (groqApiKey) return 'groq';
  if (googleApiKey) return 'google';

  return 'hybrid';
}

function createModelInstance(provider: 'google' | 'groq', rawModelName: string): LanguageModel {
  const modelName = sanitizeModelName(rawModelName, provider);
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
  // Only honor explicit per-agent overrides or global AI_MODEL_OVERRIDE;
  // Ignore generic GROQ_MODEL to maintain distinct models per operation
  const rawOverride =
    process.env[agentEnvKey] ||
    process.env.AI_MODEL_OVERRIDE;

  const override = rawOverride ? sanitizeModelName(rawOverride) : undefined;

  const provider = resolveProvider();

  if (provider === 'hybrid') {
    const target = HYBRID_ROLE_ASSIGNMENTS[agentName];
    if (target.provider === 'groq' && groqApiKey) {
      return createModelInstance('groq', override || target.model);
    }
    if (target.provider === 'google' && googleApiKey) {
      return createModelInstance('google', override || target.model);
    }
    // Failover if one key is absent in runtime environment
    if (target.provider === 'groq' && !groqApiKey && googleApiKey) {
      return createModelInstance('google', override || ROLE_MODELS.google[agentName]);
    }
    if (target.provider === 'google' && !googleApiKey && groqApiKey) {
      return createModelInstance('groq', override || ROLE_MODELS.groq[agentName]);
    }
    if (groqApiKey) return createModelInstance('groq', override || target.model);
    if (googleApiKey) return createModelInstance('google', override || target.model);
  }

  if (provider === 'groq' && groqApiKey) {
    return createModelInstance('groq', override || ROLE_MODELS.groq[agentName]);
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
 * using a dedicated failover matrix to ensure high availability without colliding models.
 */
export function getFallbackModel(agentName: AgentName): LanguageModel | undefined {
  if (process.env.MOCK_LLM === 'true' || process.env.AI_PROVIDER === 'mock') {
    return undefined;
  }

  const { googleApiKey, groqApiKey } = getApiKeys();
  const fallback = FALLBACK_ROLE_ASSIGNMENTS[agentName];

  if (fallback?.provider === 'google' && googleApiKey) {
    return createModelInstance('google', fallback.model);
  }
  if (fallback?.provider === 'groq' && groqApiKey) {
    return createModelInstance('groq', fallback.model);
  }

  // If primary provider was used and opposite key exists
  if (googleApiKey) {
    return createModelInstance('google', ROLE_MODELS.google[agentName]);
  }
  if (groqApiKey) {
    return createModelInstance('groq', ROLE_MODELS.groq[agentName]);
  }

  return undefined;
}

export const MAX_REVISIONS = parseInt(process.env.MAX_REVISIONS ?? '2', 10);
