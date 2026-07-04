import { z } from 'zod';
import type { LanguageModel } from 'ai';
import type { ZodType } from 'zod';
import type { Menu } from '@/lib/menu/types';
import type { CompetitorData } from '@/lib/types';

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
  category: z.string().max(60).nullable().optional(),
  price: z.number().nonnegative().nullable().optional(),
  currency: z.string().max(8).nullable().optional(),
  description: z.string().max(240).nullable().optional(),
  isPromo: z.boolean().nullable().optional().default(false),
});
export type CompetitorMenuItemParsed = z.infer<typeof competitorMenuItemSchema>;

export const competitorPromoSchema = z.object({
  text: z.string().min(1).max(240),
  discountPercent: z.number().int().min(1).max(99).nullable().optional(),
  validUntil: z.string().max(40).nullable().optional(),
});
export type CompetitorPromoParsed = z.infer<typeof competitorPromoSchema>;

export const competitorParserOutputSchema = z.object({
  brand: z.string().max(120).nullable().optional(),
  items: z.array(competitorMenuItemSchema).max(60),
  promos: z.array(competitorPromoSchema).max(15),
  notes: z.array(z.string().max(200)).max(6),
});
export type CompetitorParserOutput = z.infer<typeof competitorParserOutputSchema>;

// ─── Competitor Analyst output ──────────────────────────────────
export const competitorAnalystOutputSchema = z.object({
  competitors: z.array(
    z.object({
      brand: z.string().max(120),
      totalItems: z.number().int().nonnegative(),
      priceRange: z.object({
        min: z.number().nonnegative(),
        max: z.number().nonnegative(),
        average: z.number().nonnegative(),
      }),
      categories: z.array(z.string().max(60)),
      activePromos: z.number().int().nonnegative(),
      promoHighlights: z.array(z.string().max(200)).max(5),
      strengths: z.array(z.string().max(200)).max(5),
      weaknesses: z.array(z.string().max(200)).max(5),
    })
  ),
  priceComparison: z.object({
    ourCheaperCount: z.number().int().nonnegative(),
    theirCheaperCount: z.number().int().nonnegative(),
    samePriceCount: z.number().int().nonnegative(),
    biggestGap: z.object({
      ourItem: z.string(),
      theirItem: z.string(),
      difference: z.number(),
    }).optional(),
  }),
  promoIntelligence: z.array(z.object({
    competitor: z.string(),
    promo: z.string(),
    discountPercent: z.number().int().optional(),
    threat: z.enum(['low', 'medium', 'high']),
  })),
  opportunities: z.array(z.string().max(280)).min(1).max(8),
  threats: z.array(z.string().max(280)).max(6),
  recommendations: z.array(z.string().max(280)).min(1).max(8),
});
export type CompetitorAnalystOutput = z.infer<typeof competitorAnalystOutputSchema>;

// ─── Pipeline-level types ───────────────────────────────────────
export const PIPELINE_STATUSES = ['pending', 'running', 'complete', 'failed', 'cancelled', 'cancelling'] as const;
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

export const PIPELINE_AGENT_NAMES = [
  'menu-analyst',
  'weather-analyst',
  'strategist',
  'critic',
  'synthesizer',
] as const;

export const COMPETITOR_PIPELINE_AGENT_NAMES = [
  'competitor-parser',
  'competitor-analyst',
  'menu-analyst',
  'strategist',
  'critic',
  'synthesizer',
] as const;

export const STANDALONE_AGENT_NAMES = ['competitor-parser'] as const;

export const AGENT_NAMES = [
  ...PIPELINE_AGENT_NAMES,
  ...COMPETITOR_PIPELINE_AGENT_NAMES,
  ...STANDALONE_AGENT_NAMES,
] as const;
export type AgentName = (typeof AGENT_NAMES)[number];

export const PIPELINE_AGENT_COUNT = PIPELINE_AGENT_NAMES.length;
export const COMPETITOR_PIPELINE_AGENT_COUNT = COMPETITOR_PIPELINE_AGENT_NAMES.length;

export interface PipelineContext {
  pipelineId: string;
  businessId: string;
  /** AbortSignal that fires when the pipeline is cancelled or hit a terminal error. */
  signal?: AbortSignal;
}

export type {
  WeatherData,
  WeatherResult,
  CompetitorScrapeResult,
  CompetitorData,
  CompetitorMenuItem,
  CompetitorPromo,
} from '@/lib/types';

// ─── Agent input types ──────────────────────────────────────────
export interface MenuAnalystInput {
  menu: {
    businessId: string;
    items: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      tags?: string[];
      description?: string;
    }>;
  };
}

export interface WeatherAnalystInput {
  weather: {
    city: string;
    country: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    condition: string;
    windSpeed: number;
    units: string;
  };
}

export interface CompetitorParserInput {
  scrape: {
    url: string;
    finalUrl: string;
    title: string;
    text: string;
    scrapedAt: string;
  };
}

export interface CompetitorAnalystInput {
  competitors: Array<{
    brand: string | null;
    items: Array<{
      name: string;
      category?: string;
      price?: number;
      currency?: string;
      description?: string;
      isPromo: boolean;
    }>;
    promos: Array<{
      text: string;
      discountPercent?: number;
      validUntil?: string;
    }>;
    notes: string[];
  }>;
  ourMenu: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
  }>;
}

// ─── Agent run types (moved from run.ts) ────────────────────────────

export interface AgentRunArgs<Output> {
  agentName: AgentName;
  model: LanguageModel;
  instructions: string;
  prompt: string;
  schema: ZodType<Output>;
  schemaName: string;
  context: PipelineContext;
  /** Optional structured input echoed into the AgentRun row for debugging. */
  inputSnapshot?: unknown;
  /** Defaults to 0 (no retry). Total attempts = retries + 1. */
  retries?: number;
}

export interface AgentRunResult<Output> {
  agentRunId: string;
  output: Output;
  durationMs: number;
  tokenCount: number;
}

// ─── Composite agent input types (moved from individual agent files) ──

export interface CriticInput {
  menuAnalysis: MenuAnalystOutput;
  weatherAnalysis: WeatherAnalystOutput;
  strategistOutput: StrategistOutput;
}

export interface SynthesizerInput {
  menuAnalysis: MenuAnalystOutput;
  weatherAnalysis: WeatherAnalystOutput;
  strategistOutput: StrategistOutput;
  criticOutput: CriticOutput;
}

export interface StrategistInput {
  menuAnalysis: MenuAnalystOutput;
  weatherAnalysis: WeatherAnalystOutput;
  rawMenu: Menu;
  competitorData?: CompetitorData[];
  competitorAnalysis?: CompetitorAnalystOutput;
  criticFeedback?: CriticOutput;
  revision: number;
}
