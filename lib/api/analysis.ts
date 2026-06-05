import { z } from 'zod';

export const agentRunStatusSchema = z.enum([
  'pending',
  'running',
  'complete',
  'failed',
]);
export type AgentRunStatus = z.infer<typeof agentRunStatusSchema>;

export const pipelineStatusSchema = agentRunStatusSchema;
export type PipelineStatus = AgentRunStatus;

export const confidenceLevelSchema = z.enum(['low', 'medium', 'high']);
export type ConfidenceLevel = z.infer<typeof confidenceLevelSchema>;

export const actionTypeSchema = z.enum([
  'promote',
  'discount',
  'hold',
  'remove',
]);
export type ActionType = z.infer<typeof actionTypeSchema>;

export const pipelineAgentRunSchema = z.object({
  id: z.string(),
  agentName: z.string(),
  status: agentRunStatusSchema,
  durationMs: z.number().nullable(),
  tokenCount: z.number().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  error: z.string().nullable(),
  output: z.unknown(),
});
export type PipelineAgentRun = z.infer<typeof pipelineAgentRunSchema>;

export const recommendationActionDetailsSchema = z.object({
  itemId: z.string().optional(),
  priority: z.number().optional(),
  reason: z.string().optional(),
  discountPercent: z.number().optional(),
});
export type RecommendationActionDetails = z.infer<
  typeof recommendationActionDetailsSchema
>;

export const recommendationActionSchema = z.object({
  id: z.string(),
  actionType: actionTypeSchema,
  item: z.string(),
  details: recommendationActionDetailsSchema,
});
export type RecommendationAction = z.infer<typeof recommendationActionSchema>;

export const pipelineRecommendationSchema = z.object({
  id: z.string(),
  summary: z.string(),
  reasoning: z.string(),
  confidence: confidenceLevelSchema,
  category: z.string(),
  priority: z.number(),
  status: z.string(),
  createdAt: z.string(),
  criticNotes: z.unknown(),
  actions: z.array(recommendationActionSchema),
});
export type PipelineRecommendation = z.infer<
  typeof pipelineRecommendationSchema
>;

export const pipelineStatusResponseSchema = z.object({
  pipelineId: z.string(),
  status: pipelineStatusSchema,
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  agentRuns: z.array(pipelineAgentRunSchema),
  recommendation: pipelineRecommendationSchema.nullable(),
});
export type PipelineStatusResponse = z.infer<
  typeof pipelineStatusResponseSchema
>;

export const enqueueAnalysisResponseSchema = z.object({
  pipelineId: z.string(),
  jobId: z.string().optional(),
  status: z.string(),
  statusUrl: z.string().optional(),
});
export type EnqueueAnalysisResponse = z.infer<
  typeof enqueueAnalysisResponseSchema
>;

const errorResponseSchema = z.object({ error: z.string() }).passthrough();

export async function enqueueAnalysis(
  businessId: string
): Promise<EnqueueAnalysisResponse> {
  const res = await fetch('/api/analysis/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId }),
  });
  if (!res.ok) {
    const parsed = errorResponseSchema.safeParse(
      await res.json().catch(() => ({}))
    );
    throw new Error(
      parsed.success ? parsed.data.error : `enqueue failed (${res.status})`
    );
  }
  return enqueueAnalysisResponseSchema.parse(await res.json());
}

export async function fetchAnalysisStatus(
  pipelineId: string
): Promise<PipelineStatusResponse> {
  const res = await fetch(`/api/analysis/${pipelineId}`);
  if (!res.ok) {
    const parsed = errorResponseSchema.safeParse(
      await res.json().catch(() => ({}))
    );
    throw new Error(
      parsed.success ? parsed.data.error : `status fetch failed (${res.status})`
    );
  }
  return pipelineStatusResponseSchema.parse(await res.json());
}
