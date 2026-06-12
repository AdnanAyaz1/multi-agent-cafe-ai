'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cloud, Search, Loader2 } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { getImpactLevel, IMPACT_MESSAGES } from '@/utils/weather';
import { WeatherBackground } from '@/components/dashboard/weather/WeatherBackground';
import { ConditionIcon } from '@/components/dashboard/weather/ConditionIcon';
import { SUGGESTED_CITIES, IMPACT_ACTIONS, IMPACT_COLORS } from '@/constants/weather-display';

export default function WeatherPage() {
  const [city, setCity] = useState('');
  const { weather, loading, error, fetch: fetchWeather } = useWeather();
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = () => {
    if (city.trim()) fetchWeather(city);
  };

  const impact = weather ? getImpactLevel(weather.condition) : null;
  const impactColor = impact ? IMPACT_COLORS[impact] : IMPACT_COLORS.low;

  return (
    <div className="relative min-h-[calc(100vh-5rem)]">
      {weather && <WeatherBackground condition={weather.condition} />}

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-12 bg-blue-500" />
            <p className="text-[11px] text-blue-500 uppercase tracking-[0.2em] font-semibold font-mono">
              Weather Intelligence
            </p>
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
            {weather ? (
              <>{weather.city} <span className="text-white/40">Weather</span></>
            ) : (
              <>Weather Intelligence</>
            )}
          </h1>
          <p className="text-zinc-400 text-sm lg:text-base max-w-lg">
            {weather ? `${weather.condition} — driving real-time menu optimization.` : 'Search any city to get AI-powered menu recommendations.'}
          </p>
        </div>

        {/* Search bar */}
        <div className="glass-card rounded-2xl p-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search city..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/20 transition-all duration-150"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !city.trim()}
              className="px-6 py-3 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 disabled:opacity-50 transition-all duration-150 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-2 text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

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
                {/* Main weather hero */}
                <div className="lg:col-span-8">
                  <div className="glass-card rounded-3xl overflow-hidden">
                    <div className="relative z-10">
                      <div className="h-1 w-full bg-blue-500" />
                      <div className="p-8 lg:p-10">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                              <ConditionIcon condition={weather.condition} size={28} />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-white">{weather.city}</h2>
                              <p className="text-zinc-400 text-sm">{weather.country}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[11px] text-green-500 font-semibold font-mono">LIVE</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-6 mb-10">
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-8xl lg:text-9xl font-extrabold text-white leading-none">
                                {weather.temperature}
                              </span>
                              <span className="text-3xl text-zinc-400 font-light">°C</span>
                            </div>
                            <p className="text-zinc-400 text-lg mt-2">
                              {weather.condition}
                            </p>
                          </div>
                          <ConditionIcon condition={weather.condition} size={64} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Feels Like', value: `${weather.feelsLike}°C` },
                            { label: 'Humidity', value: `${weather.humidity}%` },
                            { label: 'Wind', value: `${weather.windSpeed} m/s` },
                            { label: 'Units', value: weather.units === 'metric' ? 'Metric' : 'Imperial' },
                          ].map((stat) => (
                            <div key={stat.label} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center hover:bg-zinc-800 transition-all duration-150">
                              <p className="text-white text-lg font-bold font-mono">{stat.value}</p>
                              <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 font-mono">{stat.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impact sidebar */}
                <div className="lg:col-span-4">
                  <div className="glass-card rounded-3xl overflow-hidden h-full">
                    <div className="relative z-10 p-6 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                          <span className="text-blue-500 text-sm font-bold">AI</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">Business Impact</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">AI analysis</p>
                        </div>
                      </div>

                      {impact && (
                        <div className="flex-1 flex flex-col">
                          <div className="relative mb-6">
                            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-blue-500 transition-all duration-1000 ease-out"
                                style={{ width: impact === 'high' ? '90%' : impact === 'medium' ? '55%' : '25%' }}
                              />
                            </div>
                            <div className="flex justify-between mt-1.5">
                              <span className="text-[8px] text-zinc-500 uppercase font-mono">Low</span>
                              <span className="text-[8px] text-zinc-500 uppercase font-mono">High</span>
                            </div>
                          </div>

                          <div className="p-5 rounded-2xl mb-4 bg-zinc-900 border border-zinc-800">
                            <p className="text-3xl font-extrabold mb-1 text-white">
                              {impact.charAt(0).toUpperCase() + impact.slice(1)}
                            </p>
                            <p className="text-zinc-500 text-xs uppercase tracking-wider font-mono">Impact level</p>
                          </div>

                          <p className="text-zinc-400 text-sm leading-relaxed flex-1">
                            {IMPACT_MESSAGES[impact]}
                          </p>

                          <div className="mt-6 space-y-2">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-3 font-mono">Suggested actions</p>
                            {IMPACT_ACTIONS[impact].map((action, i) => (
                              <div key={action} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all duration-150 cursor-pointer group">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 bg-blue-500/10 group-hover:scale-110 transition-transform">
                                  <span className="text-[9px] font-bold font-mono text-blue-500">{i + 1}</span>
                                </div>
                                <span className="text-[12px] text-white/70 group-hover:text-white transition-colors">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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
                <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-8">Get real-time weather analysis and AI-powered menu optimization suggestions.</p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {SUGGESTED_CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCity(c); fetchWeather(c); }}
                      className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-medium hover:bg-zinc-800 hover:border-zinc-700 hover:text-white transition-all duration-150"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
