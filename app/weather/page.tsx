'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/dashboard/ui/PageHeader';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { WeatherStatsOverview } from '@/components/dashboard/home/WeatherStatsOverview';
import { WeatherSearchCard } from '@/components/dashboard/home/WeatherSearchCard';
import { WeatherDisplayCard } from '@/components/dashboard/home/WeatherDisplayCard';
import { useWeather } from '@/hooks/useWeather';

export default function WeatherPage() {
  const [city, setCity] = useState('');
  const { weather, loading, error, fetch: fetchWeather } = useWeather();

  return (
    <div className='space-y-12'>
      <PageHeader
        title="Weather & Menu Management"
        subtitle="Weather-driven menu optimization powered by AI agents."
      />

      {weather ? (
        <>
          <WeatherStatsOverview
            city={weather.city}
            country={weather.country}
            temperature={weather.temperature}
            condition={weather.condition}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 mb-8 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <WeatherSearchCard
                city={city}
                onCityChange={setCity}
                onSearch={() => fetchWeather(city)}
                loading={loading}
                error={error}
              />
            </div>
            <div className="lg:col-span-8">
              <WeatherDisplayCard data={weather} />
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 mt-6  gap-6">
          <div className="lg:col-span-4 space-y-6">
            <WeatherSearchCard
              city={city}
              onCityChange={setCity}
              onSearch={() => fetchWeather(city)}
              loading={loading}
              error={error}
            />
          </div>
          <div className="lg:col-span-8">
            <EmptyState
              icon="🌤️"
              title="No Weather Data"
              description="Search for a city to get weather insights and menu recommendations."
            />
          </div>
        </div>
      )}
    </div>
  );
}
