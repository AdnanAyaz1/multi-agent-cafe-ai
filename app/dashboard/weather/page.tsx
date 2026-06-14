'use client';

import { Cloud } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useWeatherPage } from '@/hooks/useWeatherPage';
import { WeatherBackground } from '@/components/dashboard/weather/WeatherBackground';
import { WeatherHeader } from '@/components/dashboard/weather/WeatherHeader';
import { WeatherSearchForm } from '@/components/dashboard/weather/WeatherSearchForm';
import { WeatherHero } from '@/components/dashboard/weather/WeatherHero';
import { WeatherImpactSidebar } from '@/components/dashboard/weather/WeatherImpactSidebar';

export default function WeatherPage() {
  const {
    city,
    setCity,
    setIsFocused,
    weather,
    loading,
    error,
    handleSearch,
    impact,
  } = useWeatherPage();

  return (
    <div className="relative min-h-[calc(100vh-5rem)]">
      {weather && <WeatherBackground condition={weather.condition} />}

      <div className="relative z-10 space-y-8">
        <WeatherHeader city={weather?.city} condition={weather?.condition} />

        <WeatherSearchForm
          city={city}
          onCityChange={setCity}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSearch={handleSearch}
          loading={loading}
          error={error}
        />

        <AnimatePresence mode="wait">
          {weather ? (
            <motion.div
              key={weather.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <WeatherHero weather={weather} />
                </div>
                <div className="lg:col-span-4">
                  {impact && <WeatherImpactSidebar impact={impact} />}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card rounded-3xl p-16 text-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
                  <Cloud className="w-10 h-10 text-zinc-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Search for a city</h3>
                <p className="text-zinc-400 text-sm max-w-sm mx-auto">Get real-time weather analysis and AI-powered menu optimization suggestions.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
