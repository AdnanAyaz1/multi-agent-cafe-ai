import { tool } from 'ai';
import { z } from 'zod';
import { fetchWeather } from '@/lib/services/weather/client';

export const weatherTool = tool({
  description:
    'Get current weather for a city. Use whenever the user asks about weather, temperature, or conditions.',
  inputSchema: z.object({
    city: z.string().describe('City name, e.g. "London" or "New York"'),
  }),
  execute: async ({ city }) => {
    try {
      return await fetchWeather(city);
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to fetch weather' };
    }
  },
});
