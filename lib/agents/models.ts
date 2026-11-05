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
 * Free Tier Standard Models:
 * - Google Gemini:
 *   - `gemini-3.8-flash`: Google's primary intelligent agent model for autonomous workflows, reasoning, & synthesis.
 *   - `gemini-3.5-flash-lite`: Google's ultra-fast lightweight model for extraction, parsing, and classification.
 * - Groq:
 *   - `openai/gpt-oss-20b`: Ultra-fast (~1,000 tps) open-weights model for rapid structured extraction.
 *   - `openai/gpt-oss-120b`: Flagship open-weights reasoning model for complex planning and adversarial critique.
 */
export const ROLE_MODELS: Record<'google' | 'groq', Record<AgentName, string>> = {
  google: {
    'menu-analyst': 'gemini-3.5-flash-lite',
    'weather-analyst': 'gemini-3.5-flash-lite',
    strategist: 'gemini-3.8-flash',
    critic: 'gemini-3.8-flash',
    synthesizer: 'gemini-3.8-flash',
    'competitor-parser': 'gemini-3.5-flash-lite',
    'competitor-analyst': 'gemini-3.8-flash',
  },
  groq: {
    'menu-analyst': 'openai/gpt-oss-20b',
    'weather-analyst': 'openai/gpt-oss-20b',
    strategist: 'openai/gpt-oss-120b',
    critic: 'openai/gpt-oss-120b',
    synthesizer: 'openai/gpt-oss-120b',
    'competitor-parser': 'openai/gpt-oss-20b',
    'competitor-analyst': 'openai/gpt-oss-120b',
  },
};

/**
 * Hybrid multi-model configuration:
 * Splits execution across Groq and Google Gemini to:
 * 1. Prevent concurrent rate-limit collisions during parallel fan-out steps.
 * 2. Leverage Groq (GPT-OSS 20B) for sub-second structured JSON extraction.
 * 3. Leverage Google Gemini (Gemini 3.8 Flash) for deep strategy reasoning and executive briefing.
 * 4. Leverage Groq (GPT-OSS 120B) for independent cross-family adversarial critique.
 */
export const HYBRID_ROLE_ASSIGNMENTS: Record<
  AgentName,
  { provider: 'google' | 'groq'; model: string }
> = {
  // Fast extraction (Groq GPT-OSS 20B) - ~1,000 tps, parallel safe, zero Gemini quota used
  'menu-analyst': { provider: 'groq', model: 'openai/gpt-oss-20b' },
  'weather-analyst': { provider: 'groq', model: 'openai/gpt-oss-20b' },
  'competitor-parser': { provider: 'groq', model: 'openai/gpt-oss-20b' },

  // Deep Reasoning & Strategy (Google Gemini 3.8 Flash) - premier agent reasoning
  strategist: { provider: 'google', model: 'gemini-3.8-flash' },

  // Cross-Model Adversarial Audit (Groq GPT-OSS 120B) - independent model family critique
  critic: { provider: 'groq', model: 'openai/gpt-oss-120b' },

  // Competitive Positioning (Google Gemini 3.8 Flash)
  'competitor-analyst': { provider: 'google', model: 'gemini-3.8-flash' },

  // Executive Synthesis & Briefing (Google Gemini 3.8 Flash) - polished owner briefing markdown
  synthesizer: { provider: 'google', model: 'gemini-3.8-flash' },
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
 * - If AI_PROVIDER explicitly set ('hybrid' | 'google' | 'groq') -> respects it
 * - If BOTH Google and Groq keys are valid -> defaults to 'hybrid'
 * - If only one provider key is valid -> uses that provider
 */
export function resolveProvider(preferred?: string): AIProvider {
  if (process.env.MOCK_LLM === 'true' || process.env.AI_PROVIDER === 'mock') {
    return 'mock';
  }

  const { googleApiKey, groqApiKey } = getApiKeys();
  const explicit = (preferred || process.env.AI_PROVIDER)?.toLowerCase();

  if (explicit === 'hybrid' || explicit === 'google' || explicit === 'groq') {
    return explicit as AIProvider;
  }

  // When both keys are available, hybrid is the optimal architecture
  if (googleApiKey && groqApiKey) {
    return 'hybrid';
  }

  if (googleApiKey) return 'google';
  if (groqApiKey) return 'groq';

  return 'google';
}

function createModelInstance(provider: 'google' | 'groq', modelName: string): LanguageModel {
  const { googleApiKey, groqApiKey } = getApiKeys();

  if (provider === 'google') {
    if (!googleApiKey) {
      throw new Error(
        'Google Gemini API key required but not found in GOOGLE_GENERATIVE_AI_API_KEY / GEMINI_API_KEY.'
      );
    }
    const google = createGoogleGenerativeAI({ apiKey: googleApiKey });
    return google(modelName) as unknown as LanguageModel;
  }

  if (!groqApiKey) {
    throw new Error('Groq API key required but not found in GROQ_API_KEY.');
  }
  const groq = createGroq({ apiKey: groqApiKey });
  return groq(modelName) as unknown as LanguageModel;
}

export function getModel(agentName: AgentName): LanguageModel {
  if (process.env.MOCK_LLM === 'true' || process.env.AI_PROVIDER === 'mock') {
    return { modelId: 'mock-model', provider: 'mock' } as unknown as LanguageModel;
  }

  const { googleApiKey, groqApiKey } = getApiKeys();
  if (!googleApiKey && !groqApiKey) {
    throw new Error(
      'No valid AI provider API key found. Please provide GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY) or GROQ_API_KEY in your environment.'
    );
  }

  const agentEnvKey = `MODEL_${agentName.toUpperCase().replace(/-/g, '_')}`;
  const override =
    process.env[agentEnvKey] ||
    process.env.AI_MODEL_OVERRIDE ||
    (agentName.includes('competitor') || agentName === 'menu-analyst' || agentName === 'weather-analyst'
      ? process.env.GROQ_MODEL
      : undefined);

  const provider = resolveProvider();

  if (provider === 'hybrid') {
    const target = HYBRID_ROLE_ASSIGNMENTS[agentName];
    if (target.provider === 'groq' && groqApiKey) {
      return createModelInstance('groq', override || target.model);
    }
    if (target.provider === 'google' && googleApiKey) {
      return createModelInstance('google', override || target.model);
    }
    // Fallback if one key is missing
    if (groqApiKey) return createModelInstance('groq', override || ROLE_MODELS.groq[agentName]);
    if (googleApiKey) return createModelInstance('google', override || ROLE_MODELS.google[agentName]);
  }

  if (provider === 'google' && googleApiKey) {
    return createModelInstance('google', override || ROLE_MODELS.google[agentName]);
  }

  if (provider === 'groq' && groqApiKey) {
    return createModelInstance('groq', override || ROLE_MODELS.groq[agentName]);
  }

  // Graceful fallback to whichever key exists
  if (googleApiKey) return createModelInstance('google', override || ROLE_MODELS.google[agentName]);
  if (groqApiKey) return createModelInstance('groq', override || ROLE_MODELS.groq[agentName]);

  throw new Error('No valid AI provider API key found.');
}

/**
 * Returns an alternative fallback model on the opposite provider (if available)
 * so that transient rate-limit or quota issues on one provider fail over cleanly.
 */
export function getFallbackModel(agentName: AgentName): LanguageModel | undefined {
  if (process.env.MOCK_LLM === 'true' || process.env.AI_PROVIDER === 'mock') {
    return undefined;
  }

  const { googleApiKey, groqApiKey } = getApiKeys();
  // Failover is only possible when both keys are provisioned
  if (!googleApiKey || !groqApiKey) {
    return undefined;
  }

  const provider = resolveProvider();
  if (provider === 'hybrid') {
    const primary = HYBRID_ROLE_ASSIGNMENTS[agentName];
    if (primary.provider === 'groq') {
      return createModelInstance('google', ROLE_MODELS.google[agentName]);
    }
    return createModelInstance('groq', ROLE_MODELS.groq[agentName]);
  }

  if (provider === 'google') {
    return createModelInstance('groq', ROLE_MODELS.groq[agentName]);
  }

  if (provider === 'groq') {
    return createModelInstance('google', ROLE_MODELS.google[agentName]);
  }

  return undefined;
}

export const MAX_REVISIONS = parseInt(process.env.MAX_REVISIONS ?? '2', 10);
