import {
  competitorAnalystOutputSchema,
  type CompetitorAnalystOutput,
  type CompetitorAnalystInput,
  type PipelineContext,
} from './types';
import { withAgentRun, type AgentRunResult } from './run';
import { getModel } from './models';
import { COMPETITOR_ANALYST_SYSTEM, buildCompetitorAnalystPrompt } from './prompts';

export async function runCompetitorAnalyst(
  input: CompetitorAnalystInput,
  context: PipelineContext
): Promise<AgentRunResult<CompetitorAnalystOutput>> {
  return withAgentRun({
    agentName: 'competitor-analyst',
    model: getModel('competitor-analyst'),
    instructions: COMPETITOR_ANALYST_SYSTEM,
    prompt: buildCompetitorAnalystPrompt(input),
    schema: competitorAnalystOutputSchema,
    schemaName: 'CompetitorAnalysis',
    context,
    inputSnapshot: {
      competitorCount: input.competitors.length,
      totalItems: input.competitors.reduce((s, c) => s + c.items.length, 0),
      ourMenuSize: input.ourMenu.length,
    },
    retries: 1,
  });
}
