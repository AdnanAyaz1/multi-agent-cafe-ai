import { generateText, isStepCount, type LanguageModel } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { weatherTool } from '@/lib/agents/tools/weatherTool';
import { WeatherData, WeatherResult } from '@/lib/types';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY,
});

export async function getWeatherData(city: string): Promise<WeatherResult> {
  const model = process.env.GOOGLE_MODEL ?? 'gemini-2.5-flash';

  try {
    const result = await generateText({
      model: google(model) as unknown as LanguageModel,
      tools: { weather: weatherTool },
      toolChoice: 'required',
      prompt: `Get the current weather for ${city}.`,
      stopWhen: isStepCount(2),
    });

    const step = result.steps.at(-1);
    const toolResult = step?.staticToolResults?.[0];

    if (!toolResult) return { error: 'No weather data received' };

    const output = toolResult.output as WeatherData & { error?: string };

    if ('error' in output) return { error: output.error };

    return { data: output };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Agent failed' };
  }
}
