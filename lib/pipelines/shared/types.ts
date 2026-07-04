import { z } from 'zod';
import type { StrategistOutput, CriticOutput, SynthesizerOutput } from '@/lib/agents/types';
import type { CompetitorData } from '@/lib/types';
import type { getMenuForBusiness } from '@/lib/menu';

// ─── Pipeline types ───────────────────────────────────────────────

export const pipelineTypeEnum = z.enum(['weather', 'competitor']);
export type PipelineType = z.infer<typeof pipelineTypeEnum>;

export const pipelineStatusEnum = z.enum(['pending', 'running', 'complete', 'failed', 'cancelled', 'cancelling']);
export type PipelineStatus = z.infer<typeof pipelineStatusEnum>;

export interface PipelineContext {
  pipelineId: string;
  businessId: string;
  pipelineType: PipelineType;
  /** AbortSignal that fires when the pipeline is cancelled or hit a terminal error. */
  signal?: AbortSignal;
}

export interface PipelineResult {
  pipelineId: string;
  recommendationId: string;
  revisions: number;
  durationMs: number;
  pipelineType: PipelineType;
}

export const PIPELINE_TYPES = ['weather', 'competitor'] as const;

// ─── Abort types (moved from errors.ts and abort.ts) ─────────────

export type PipelineAbortReason =
  | 'user_cancelled'
  | 'rate_limit'
  | 'quota_exceeded'
  | 'pipeline_failed'
  | 'timeout';

export interface PipelineRunContext {
  pipelineId: string;
  businessId: string;
  pipelineType: 'weather' | 'competitor';
  signal: AbortSignal;

  /** Abort the entire pipeline with a reason. Updates Redis + DB. */
  abort(reason: PipelineAbortReason): Promise<void>;

  /** Check Redis cancellation flag and throw if cancelled. */
  throwIfCancelled(): Promise<void>;
}

// ─── Pipeline input types (moved from helper files) ───────────────

export interface WeatherPipelineInputs {
  weather: import('@/lib/types').WeatherData;
  menu: Awaited<ReturnType<typeof getMenuForBusiness>>;
  competitors: CompetitorData[];
}

export interface CompetitorPipelineInputs {
  menu: Awaited<ReturnType<typeof getMenuForBusiness>>;
  competitorSnapshots: CompetitorData[];
}

// ─── Persist types (moved from shared/helpers.ts) ────────────────

export interface PersistArgs {
  strategist: StrategistOutput;
  critic: CriticOutput;
  synthesizer: SynthesizerOutput;
  finalConfidence: string;
}
