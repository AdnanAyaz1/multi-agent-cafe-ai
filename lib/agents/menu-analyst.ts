import {
  menuAnalystOutputSchema,
  type MenuAnalystOutput,
  type PipelineContext,
} from './types';
import { withAgentRun, type AgentRunResult } from './run';
import { getModel } from './models';
import {
  MENU_ANALYST_SYSTEM,
  buildMenuAnalystPrompt,
  type MenuAnalystInput,
} from './prompts';

export async function runMenuAnalyst(
  input: MenuAnalystInput,
  context: PipelineContext
): Promise<AgentRunResult<MenuAnalystOutput>> {
  return withAgentRun({
    agentName: 'menu-analyst',
    model: getModel('menu-analyst'),
    instructions: MENU_ANALYST_SYSTEM,
    prompt: buildMenuAnalystPrompt(input),
    schema: menuAnalystOutputSchema,
    schemaName: 'MenuAnalysis',
    context,
    inputSnapshot: { itemCount: input.menu.items.length },
    retries: 1,
  });
}
