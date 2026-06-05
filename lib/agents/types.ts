import { z } from 'zod';

export const ACTION_TYPES = ['promote', 'discount', 'hold', 'remove'] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const CONFIDENCE_LEVELS = ['low', 'medium', 'high'] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const ITEM_TEMPERATURES = ['hot', 'cold', 'neutral'] as const;
export type ItemTemperature = (typeof ITEM_TEMPERATURES)[number];

// ─── Menu Analyst output ────────────────────────────────────────
export const menuAnalystOutputSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        temperature: z.enum(ITEM_TEMPERATURES),
        priceTier: z.enum(['budget', 'mid', 'premium']),
        isSignature: z.boolean(),
        notes: z.string().max(160).optional(),
      })
    )
    .min(1)
    .max(100),
  totals: z.object({
    hot: z.number().int().nonnegative(),
    cold: z.number().int().nonnegative(),
    neutral: z.number().int().nonnegative(),
  }),
  observations: z.array(z.string().max(280)).max(8),
});
export type MenuAnalystOutput = z.infer<typeof menuAnalystOutputSchema>;

// ─── Weather Analyst output ─────────────────────────────────────
export const weatherAnalystOutputSchema = z.object({
  headline: z.string().max(160),
  tempBucket: z.enum(['freezing', 'cold', 'cool', 'mild', 'warm', 'hot']),
  precipitation: z.enum(['none', 'light', 'moderate', 'heavy']),
  comfortIndex: z.enum(['miserable', 'uncomfortable', 'pleasant', 'ideal']),
  consumerSignals: z.array(z.string().max(200)).min(1).max(6),
  expectedDemandShift: z.object({
    hotItems: z.enum(['down', 'flat', 'up', 'spike']),
    coldItems: z.enum(['down', 'flat', 'up', 'spike']),
    food: z.enum(['down', 'flat', 'up', 'spike']),
    dessert: z.enum(['down', 'flat', 'up', 'spike']),
  }),
});
export type WeatherAnalystOutput = z.infer<typeof weatherAnalystOutputSchema>;

// ─── Strategist output ──────────────────────────────────────────
export const strategistActionSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  action: z.enum(ACTION_TYPES),
  discountPercent: z.number().int().min(0).max(50).optional(),
  priority: z.number().int().min(1).max(5),
  reason: z.string().max(280),
});
export type StrategistAction = z.infer<typeof strategistActionSchema>;

export const strategistOutputSchema = z.object({
  actions: z.array(strategistActionSchema).min(1).max(20),
  summary: z.string().max(400),
  confidence: z.enum(CONFIDENCE_LEVELS),
});
export type StrategistOutput = z.infer<typeof strategistOutputSchema>;

// ─── Critic output ──────────────────────────────────────────────
export const criticOutputSchema = z.object({
  approved: z.boolean(),
  overallNotes: z.string().max(400),
  issues: z
    .array(
      z.object({
        itemId: z.string().optional(),
        severity: z.enum(['info', 'warning', 'blocker']),
        message: z.string().max(280),
      })
    )
    .max(15),
  suggestedRevisions: z.array(z.string().max(280)).max(8),
});
export type CriticOutput = z.infer<typeof criticOutputSchema>;

// ─── Synthesizer output ─────────────────────────────────────────
export const synthesizerOutputSchema = z.object({
  headline: z.string().max(160),
  briefingMarkdown: z.string().min(1).max(4000),
  finalConfidence: z.enum(CONFIDENCE_LEVELS),
});
export type SynthesizerOutput = z.infer<typeof synthesizerOutputSchema>;

// ─── Competitor Parser output ───────────────────────────────────
export const competitorMenuItemSchema = z.object({
  name: z.string().min(1).max(160),
  category: z.string().max(60).optional(),
  price: z.number().nonnegative().optional(),
  currency: z.string().max(8).optional(),
  description: z.string().max(240).optional(),
  isPromo: z.boolean(),
});
export type CompetitorMenuItemParsed = z.infer<typeof competitorMenuItemSchema>;

export const competitorPromoSchema = z.object({
  text: z.string().min(1).max(240),
  discountPercent: z.number().int().min(1).max(99).optional(),
  validUntil: z.string().max(40).optional(),
});
export type CompetitorPromoParsed = z.infer<typeof competitorPromoSchema>;

export const competitorParserOutputSchema = z.object({
  brand: z.string().max(120).optional(),
  items: z.array(competitorMenuItemSchema).max(60),
  promos: z.array(competitorPromoSchema).max(15),
  notes: z.array(z.string().max(200)).max(6),
});
export type CompetitorParserOutput = z.infer<typeof competitorParserOutputSchema>;

// ─── Pipeline-level types ───────────────────────────────────────
export const PIPELINE_STATUSES = ['pending', 'running', 'complete', 'failed'] as const;
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

// Re-export AgentName from its canonical location so existing
// `import { AgentName } from '@/lib/agents/types'` keeps working.
export { AGENT_NAMES } from '@/constants/agents';
export type { AgentName } from '@/constants/agents';

export interface PipelineContext {
  pipelineId: string;
  businessId: string;
}

export type {
  WeatherData,
  WeatherResult,
  CompetitorScrapeResult,
  CompetitorData,
  CompetitorMenuItem,
  CompetitorPromo,
} from '@/lib/types';
