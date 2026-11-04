'use client';

import { useState, useEffect } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { getImpactLevel } from '@/utils/weather';
import { IMPACT_COLORS } from '@/constants/weather-display';

export function useWeatherPage() {
  const [city, setCity] = useState('');
  const [operationalCities, setOperationalCities] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const { weather, loading, error, fetch: fetchWeather } = useWeather();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.business?.cities) {
          const list = data.business.cities as string[];
          setOperationalCities(list);
          if (list.length > 0) {
            const initialCity = list[0];
            setCity(initialCity);
            fetchWeather(initialCity);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (customCity?: string) => {
    const target = (customCity || city).trim();
    if (target) {
      setCity(target);
      fetchWeather(target);
    }
  };

  const selectOperationalCity = (selectedCity: string) => {
    setCity(selectedCity);
    fetchWeather(selectedCity);
  };

  const impact = weather ? getImpactLevel(weather.condition) : null;
  const impactColor = impact ? IMPACT_COLORS[impact] : IMPACT_COLORS.low;

  return {
    city,
    setCity,
    operationalCities,
    selectOperationalCity,
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
