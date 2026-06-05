'use client';

import { useState } from 'react';
import type { WeatherData } from '@/lib/types';
import { fetchWeather } from '@/lib/api/weather';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async (city: string) => {
    setLoading(true);
    setError(null);
    setWeather(null);

    try {
      const res = await fetchWeather(city);
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
