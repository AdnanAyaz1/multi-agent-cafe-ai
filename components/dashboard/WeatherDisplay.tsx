'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWeather } from '@/hooks/useWeather';
import { WeatherCard } from './WeatherCard';

export default function WeatherDisplay() {
  const [city, setCity] = useState('');
  const { weather, loading, error, fetch: fetchWeather } = useWeather();

  const handleSubmit = () => {
    const trimmed = city.trim();
    if (trimmed) fetchWeather(trimmed);
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-center text-2xl font-bold">Weather Agent</h1>

      <div className="mb-6 flex gap-2">
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <Button onClick={handleSubmit} disabled={loading || !city.trim()}>
          {loading ? 'Loading...' : 'Get Weather'}
        </Button>
      </div>

      {error && (
        <Card className="mb-4 border-destructive">
          <CardContent className="text-destructive">{error}</CardContent>
        </Card>
      )}

      {weather && <WeatherCard data={weather} />}
    </div>
  );
}
