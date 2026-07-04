import {
  weatherAnalystOutputSchema,
  type WeatherAnalystOutput,
  type WeatherAnalystInput,
  type PipelineContext,
} from './types';
import { withAgentRun, type AgentRunResult } from './run';
import { getModel } from './models';
import { WEATHER_ANALYST_SYSTEM, buildWeatherAnalystPrompt } from './prompts';

export async function runWeatherAnalyst(
  input: WeatherAnalystInput,
  context: PipelineContext
): Promise<AgentRunResult<WeatherAnalystOutput>> {
  return withAgentRun({
    agentName: 'weather-analyst',
    model: getModel('weather-analyst'),
    instructions: WEATHER_ANALYST_SYSTEM,
    prompt: buildWeatherAnalystPrompt(input),
    schema: weatherAnalystOutputSchema,
    schemaName: 'WeatherAnalysis',
    context,
    inputSnapshot: { city: input.weather.city, condition: input.weather.condition },
    retries: 1,
  });
}
