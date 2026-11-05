'use client';

import { Cloud, MapPin } from 'lucide-react';
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
    operationalCities,
    selectOperationalCity,
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

        {/* Operational Branch Quick Selectors */}
        {operationalCities.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 mr-1">
              <MapPin className="w-3.5 h-3.5 text-[#e07850]" /> Your Operational Branches:
            </span>
            {operationalCities.map((opCity) => (
              <button
                key={opCity}
                onClick={() => selectOperationalCity(opCity)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                  city.toLowerCase() === opCity.toLowerCase()
                    ? 'bg-[#e07850] text-[#1a1208] shadow-md shadow-[#e07850]/20'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06]'
                }`}
              >
                <MapPin className="w-3 h-3 opacity-60" />
                {opCity}
              </button>
            ))}
          </div>
        )}

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
                  {impact && <WeatherImpactSidebar impact={impact} city={weather.city} />}
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
                <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                  Get real-time weather analysis and AI-powered menu optimization suggestions.
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
