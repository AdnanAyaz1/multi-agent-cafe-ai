'use client';

import { useState } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { WeatherCard } from './WeatherCard';

export default function WeatherDisplay() {
  const [city, setCity] = useState('');
  const { weather, loading, error, fetch: fetchWeather } = useWeather();

  const handleSubmit = () => {
    if (city.trim()) fetchWeather(city.trim());
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-center text-2xl font-bold">Weather Agent</h1>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="flex-1 rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !city.trim()}
          className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-400 bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {weather && <WeatherCard data={weather} />}
    </div>
  );
}
