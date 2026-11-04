import 'server-only';
import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';
import type { AgentName } from './types';

// Google Generative AI (Gemini 2.0 Flash & Gemini 1.5 Pro)
const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
const google = googleApiKey ? createGoogleGenerativeAI({ apiKey: googleApiKey }) : null;

// Groq (Fast Llama 3.1 8B & Llama 3.3 70B)
const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? createGroq({ apiKey: groqApiKey }) : null;

/**
 * Optimal models assigned by role:
 * - Extraction / Parsing / High-speed summary: Gemini 2.0 Flash / Llama 3.1 8B
 * - Deep reasoning / Pricing strategy / Adversarial critique: Gemini 1.5 Pro / Llama 3.3 70B
 */
const ROLE_MODELS: Record<'google' | 'groq', Record<AgentName, string>> = {
  google: {
    'menu-analyst': 'gemini-2.0-flash',
    'weather-analyst': 'gemini-2.0-flash',
    strategist: 'gemini-1.5-pro',
    critic: 'gemini-1.5-pro',
    synthesizer: 'gemini-2.0-flash',
    'competitor-parser': 'gemini-2.0-flash',
    'competitor-analyst': 'gemini-2.0-flash',
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
  const agentEnvKey = `MODEL_${agentName.toUpperCase().replace(/-/g, '_')}`;
  const override = process.env[agentEnvKey] || process.env.AI_MODEL_OVERRIDE;

  // Determine provider: defaults to google if key available, otherwise falls back to groq
  const preferredProvider = (process.env.AI_PROVIDER?.toLowerCase() as 'google' | 'groq') ||
    (googleApiKey ? 'google' : 'groq');

  if (preferredProvider === 'google' && google) {
    const modelName = override || ROLE_MODELS.google[agentName];
    return google(modelName) as unknown as LanguageModel;
  }

  if (groq) {
    const modelName = override || ROLE_MODELS.groq[agentName];
    return groq(modelName) as unknown as LanguageModel;
  }

  if (google) {
    const modelName = override || ROLE_MODELS.google[agentName];
    return google(modelName) as unknown as LanguageModel;
  }

  throw new Error(
    'No AI provider configured. Please provide GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY) or GROQ_API_KEY in your environment.'
  );
}

export const MAX_REVISIONS = parseInt(process.env.MAX_REVISIONS ?? '2', 10);
