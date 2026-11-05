import 'server-only';
import { generateText, isStepCount } from 'ai';
import { getModel } from '@/lib/agents/models';
import { weatherTool } from '@/lib/agents/tools/weatherTool';
import { fetchWeather } from '@/lib/services/weather/client';
import { WeatherData, WeatherResult } from '@/lib/types';

export async function getWeatherData(city: string): Promise<WeatherResult> {
  try {
    const model = getModel('weather-analyst');
    const result = await generateText({
      model,
      tools: { weather: weatherTool },
      toolChoice: 'required',
      prompt: `Get the current weather for ${city}.`,
      stopWhen: isStepCount(2),
    });

    const step = result.steps.at(-1);
    const toolResult = step?.staticToolResults?.[0];

    if (!toolResult) {
      const directData = await fetchWeather(city);
      return { data: directData };
    }

    const output = toolResult.output as WeatherData & { error?: string };

    if ('error' in output) {
      const directData = await fetchWeather(city);
      return { data: directData };
    }

    return { data: output };
  } catch (e) {
    try {
      const directData = await fetchWeather(city);
      return { data: directData };
    } catch {
      return { error: e instanceof Error ? e.message : 'Agent failed' };
    }
  }
}
