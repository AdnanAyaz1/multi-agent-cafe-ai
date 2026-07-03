import {
  strategistOutputSchema,
  type StrategistOutput,
  type MenuAnalystOutput,
  type WeatherAnalystOutput,
  type CriticOutput,
  type CompetitorAnalystOutput,
  type PipelineContext,
} from './types';
import { withAgentRun, type AgentRunResult } from './run';
import { getModel } from './models';
import { STRATEGIST_SYSTEM, buildStrategistPrompt } from './prompts';
import type { Menu } from '@/lib/menu/types';
import type { CompetitorData } from '@/lib/types';

export interface StrategistInput {
  menuAnalysis: MenuAnalystOutput;
  weatherAnalysis: WeatherAnalystOutput;
  rawMenu: Menu;
  competitorData?: CompetitorData[];
  competitorAnalysis?: CompetitorAnalystOutput;
  criticFeedback?: CriticOutput;
  revision: number;
}

export async function runStrategist(
  input: StrategistInput,
  context: PipelineContext
): Promise<AgentRunResult<StrategistOutput>> {
  const compactMenu = input.rawMenu.items.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    price: i.price,
    tags: i.tags ?? [],
  }));

  return withAgentRun({
    agentName: 'strategist',
    model: getModel('strategist'),
    instructions: STRATEGIST_SYSTEM,
    prompt: buildStrategistPrompt({
      menuAnalysis: input.menuAnalysis,
      weatherAnalysis: input.weatherAnalysis,
      rawMenu: compactMenu,
      competitorData: input.competitorData,
      competitorAnalysis: input.competitorAnalysis,
      criticFeedback: input.criticFeedback,
      revision: input.revision,
    }),
    schema: strategistOutputSchema,
    schemaName: 'StrategistPlan',
    context,
    inputSnapshot: {
      revision: input.revision,
      hasCriticFeedback: Boolean(input.criticFeedback),
      hasCompetitorData: Boolean(input.competitorData?.length),
      hasCompetitorAnalysis: Boolean(input.competitorAnalysis),
    },
    retries: 1,
  });
}
