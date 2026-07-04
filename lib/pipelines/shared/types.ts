import { z } from 'zod';

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
