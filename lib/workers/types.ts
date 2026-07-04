import type { PipelineType } from '@/lib/pipelines';

export interface AnalysisJobData {
  businessId: string;
  pipelineId: string;
  pipelineType: PipelineType;
}

export interface CompetitorJobData {
  businessId: string;
  url: string;
  /** Optional caller-supplied pipeline id (so multiple URLs share one AgentRun group). */
  pipelineId?: string;
  /** Optional scrape options forwarded to the scraper. */
  timeoutMs?: number;
  maxTextLength?: number;
}

export interface CompetitorJobResult {
  success: true;
  url: string;
  itemCount: number;
  promoCount: number;
  snapshotId: string;
  scrapeMs: number;
  parseMs: number;
}

export interface WeatherJobData {
  businessId: string;
  city: string;
  latitude?: number;
  longitude?: number;
  /** Optional caller-supplied pipeline id for cancellation checks. */
  pipelineId?: string;
}
