'use client';

import { useState } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { getImpactLevel } from '@/utils/weather';
import { IMPACT_COLORS } from '@/constants/weather-display';

export function useWeatherPage() {
  const [city, setCity] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { weather, loading, error, fetch: fetchWeather } = useWeather();

  const handleSearch = () => {
    if (city.trim()) fetchWeather(city);
  };

  const impact = weather ? getImpactLevel(weather.condition) : null;
  const impactColor = impact ? IMPACT_COLORS[impact] : IMPACT_COLORS.low;

  return {
    city,
    setCity,
    isFocused,
    setIsFocused,
    weather,
    loading,
    error,
    handleSearch,
    impact,
    impactColor,
  };
}
