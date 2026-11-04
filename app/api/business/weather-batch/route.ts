import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather } from '@/lib/services/weather/client';
import { generateWeatherSuggestion, type WeatherSuggestion } from '@/utils/weather-suggestions';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { ValidationError } from '@/lib/errors';
import { z } from 'zod';

const weatherBatchSchema = z.object({
  cities: z.array(z.string().min(1)).min(1, 'Please provide at least one city'),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const { cities } = weatherBatchSchema.parse(body);

  // Fetch weather in parallel for all cities
  const results = await Promise.allSettled(
    cities.map(async (city) => {
      const weather = await fetchWeather(city.trim());
      const suggestion = generateWeatherSuggestion(weather);
      return suggestion;
    })
  );

  const suggestions: WeatherSuggestion[] = [];
  const errors: Array<{ city: string; error: string }> = [];

  results.forEach((res, index) => {
    const city = cities[index];
    if (res.status === 'fulfilled') {
      suggestions.push(res.value);
    } else {
      errors.push({
        city,
        error: res.reason instanceof Error ? res.reason.message : 'Failed to fetch weather',
      });
    }
  });

  return NextResponse.json({
    count: suggestions.length,
    suggestions,
    errors: errors.length > 0 ? errors : undefined,
  });
});
