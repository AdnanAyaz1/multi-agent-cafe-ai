import type { AgentName } from '@/lib/agents/types';

// ─── Pipeline types ────────────────────────────────────────────────

export type PipelineType = 'weather' | 'competitor';

export type PipelineStatusValue = 'pending' | 'running' | 'complete' | 'failed' | 'cancelled' | 'cancelling';

export interface PipelineAgentRun {
  id: string;
  agentName: string;
  status: string;
  durationMs?: number;
  tokenCount?: number;
  error?: string;
}

export interface PipelineRecommendation {
  id: string;
  summary: string;
  reasoning: string;
  confidence: string;
  category: string;
  priority: number;
  status: string;
  createdAt: string;
  criticNotes?: unknown;
  actions: Array<{
    id: string;
    actionType: string;
    item: string;
    details?: {
      reason?: string;
      priority?: number;
      discountPercent?: number;
    };
  }>;
}

export interface PipelineStatusResponse {
  status: string;
  pipelineType?: PipelineType;
  agentRuns: PipelineAgentRun[];
  recommendation?: PipelineRecommendation;
}

// ─── Competitor snapshot types ──────────────────────────────────────

import type { CompetitorData } from '@/lib/types';

export interface RefreshOptions {
  url?: string;
  timeoutMs?: number;
  maxTextLength?: number;
}

export interface CompetitorSnapshot {
  id: string;
  data: CompetitorData;
  collectedAt: string;
  expiresAt: string;
}

// ─── API response types ──────────────────────────────────────────────

export interface AgentRunSummary {
  id: string;
  agentName: AgentName;
  status: string;
  durationMs: number | null;
  tokenCount: number | null;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  output: unknown;
}

export interface RecommendationSummary {
  id: string;
  summary: string;
  reasoning: string;
  confidence: string;
  category: string;
  priority: number;
  status: string;
  createdAt: string;
  actions: Array<{
    id: string;
    actionType: string;
    item: string;
    details: unknown;
  }>;
  criticNotes: unknown;
}

export interface PipelineStatusApiResponse {
  pipelineId: string;
  status: PipelineStatusValue;
  startedAt: string | null;
  completedAt: string | null;
  agentRuns: AgentRunSummary[];
  recommendation: RecommendationSummary | null;
}

export interface RawAgentRun {
  id: string;
  agentName: string;
  status: string;
  durationMs: number | null;
  tokenCount: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  error: string | null;
  output: unknown;
}

export interface RawRecommendation {
  id: string;
  summary: string;
  reasoning: string;
  confidence: string;
  category: string;
  priority: number;
  status: string;
  date: Date;
  criticNotes: unknown;
  actions: Array<{
    id: string;
    actionType: string;
    item: string;
    details: unknown;
  }>;
}

// ─── Pipeline utility types ────────────────────────────────────────

export interface AgentGroupingResult {
  byAgent: Map<string, PipelineAgentRun[]>;
  completedCount: number;
  progress: number;
}
