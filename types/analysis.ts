import type { AgentName, PipelineStatus } from '@/lib/agents/types';

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

export interface PipelineStatusResponse {
  pipelineId: string;
  status: PipelineStatus;
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
