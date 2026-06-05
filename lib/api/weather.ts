import { z } from 'zod';
import type { WeatherResult } from '@/lib/types';

const weatherDataSchema = z.object({
  city: z.string(),
  country: z.string(),
  temperature: z.number(),
  feelsLike: z.number(),
  humidity: z.number(),
  condition: z.string(),
  windSpeed: z.number(),
  units: z.enum(['metric', 'imperial']),
});

const weatherResultSchema = z.object({
  data: weatherDataSchema.optional(),
  error: z.string().optional(),
});

const errorResponseSchema = z.object({ error: z.string() }).passthrough();

export async function fetchWeather(city: string): Promise<WeatherResult> {
  const res = await fetch('/api/weather', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city }),
  });
  if (!res.ok) {
    const parsed = errorResponseSchema.safeParse(
      await res.json().catch(() => ({}))
    );
    throw new Error(
      parsed.success ? parsed.data.error : `weather fetch failed (${res.status})`
    );
  }
  return weatherResultSchema.parse(await res.json()) satisfies WeatherResult;
}
