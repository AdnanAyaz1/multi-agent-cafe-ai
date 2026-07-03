import {
  synthesizerOutputSchema,
  type SynthesizerOutput,
  type MenuAnalystOutput,
  type WeatherAnalystOutput,
  type StrategistOutput,
  type CriticOutput,
  type PipelineContext,
  type ConfidenceLevel,
  CONFIDENCE_LEVELS,
} from './types';
import { withAgentRun, type AgentRunResult } from './run';
import { getModel } from './models';
import { SYNTHESIZER_SYSTEM, buildSynthesizerPrompt } from './prompts';
import { criticHasBlockers, criticHasWarnings } from './critic';

export interface SynthesizerInput {
  menuAnalysis: MenuAnalystOutput;
  weatherAnalysis: WeatherAnalystOutput;
  strategistOutput: StrategistOutput;
  criticOutput: CriticOutput;
}

export async function runSynthesizer(
  input: SynthesizerInput,
  context: PipelineContext
): Promise<AgentRunResult<SynthesizerOutput>> {
  return withAgentRun({
    agentName: 'synthesizer',
    model: getModel('synthesizer'),
    instructions: SYNTHESIZER_SYSTEM,
    prompt: buildSynthesizerPrompt({
      menuAnalysis: input.menuAnalysis,
      weatherAnalysis: input.weatherAnalysis,
      finalActions: input.strategistOutput.actions,
      strategistSummary: input.strategistOutput.summary,
      strategistConfidence: input.strategistOutput.confidence,
      criticNotes: {
        approved: input.criticOutput.approved,
        notes: input.criticOutput.overallNotes,
        issues: input.criticOutput.issues,
      },
    }),
    schema: synthesizerOutputSchema,
    schemaName: 'OwnerBriefing',
    context,
    inputSnapshot: {
      actionCount: input.strategistOutput.actions.length,
      criticApproved: input.criticOutput.approved,
    },
    retries: 1,
  });
}

export function deriveFinalConfidence(
  strategistConfidence: ConfidenceLevel,
  critic: CriticOutput
): ConfidenceLevel {
  if (criticHasBlockers(critic)) return 'low';
  if (!criticHasWarnings(critic)) return strategistConfidence;
  const idx = CONFIDENCE_LEVELS.indexOf(strategistConfidence);
  const downgraded = Math.max(0, idx - 1);
  return CONFIDENCE_LEVELS[downgraded];
}
