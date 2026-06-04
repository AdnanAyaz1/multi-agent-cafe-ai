'use client';

import { useState } from 'react';
import { WeatherData, WeatherResult } from '@/lib/types';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async (city: string) => {
    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      const res = await fetchWeatherApi(city);
      if (res.error) setError(res.error);
      else setWeather(res.data ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return { weather, loading, error, fetch };
}

async function fetchWeatherApi(city: string): Promise<WeatherResult> {
  const res = await fetch('/api/weather', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city }),
  });
  return res.json();
}
