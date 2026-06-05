import {
  competitorParserOutputSchema,
  type CompetitorParserOutput,
  type PipelineContext,
} from './types';
import { withAgentRun, type AgentRunResult } from './run';
import { getModel } from './models';
import {
  COMPETITOR_PARSER_SYSTEM,
  buildCompetitorParserPrompt,
  type CompetitorParserInput,
} from './prompts';

export async function runCompetitorParser(
  input: CompetitorParserInput,
  context: PipelineContext
): Promise<AgentRunResult<CompetitorParserOutput>> {
  return withAgentRun({
    agentName: 'competitor-parser',
    model: getModel('competitor-parser'),
    system: COMPETITOR_PARSER_SYSTEM,
    prompt: buildCompetitorParserPrompt(input),
    schema: competitorParserOutputSchema,
    schemaName: 'CompetitorParse',
    context,
    inputSnapshot: {
      url: input.scrape.url,
      finalUrl: input.scrape.finalUrl,
      textLength: input.scrape.text.length,
    },
    retries: 1,
  });
}
