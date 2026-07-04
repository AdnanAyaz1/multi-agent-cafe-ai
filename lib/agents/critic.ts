import {
  criticOutputSchema,
  type CriticOutput,
  type CriticInput,
  type PipelineContext,
} from './types';
import { withAgentRun, type AgentRunResult } from './run';
import { getModel } from './models';
import { CRITIC_SYSTEM, buildCriticPrompt } from './prompts';

export async function runCritic(
  input: CriticInput,
  context: PipelineContext
): Promise<AgentRunResult<CriticOutput>> {
  return withAgentRun({
    agentName: 'critic',
    model: getModel('critic'),
    instructions: CRITIC_SYSTEM,
    prompt: buildCriticPrompt(input),
    schema: criticOutputSchema,
    schemaName: 'CriticReview',
    context,
    inputSnapshot: { actionsReviewed: input.strategistOutput.actions.length },
    retries: 1,
  });
}

export function criticHasBlockers(critic: CriticOutput): boolean {
  return critic.issues.some((issue) => issue.severity === 'blocker');
}

export function criticHasWarnings(critic: CriticOutput): boolean {
  return critic.issues.some((issue) => issue.severity === 'warning');
}
