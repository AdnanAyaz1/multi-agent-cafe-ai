'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Search, Loader2 } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { getImpactLevel, IMPACT_MESSAGES } from '@/utils/weather';
import { WeatherBackground } from '@/components/dashboard/weather/WeatherBackground';
import { ConditionIcon } from '@/components/dashboard/weather/ConditionIcon';
import { FloatingOrb } from '@/components/dashboard/weather/FloatingOrb';
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

      <FloatingOrb color="#00d2ff" size={300} x="-5%" y="10%" delay={0} />
      <FloatingOrb color="#1fe19e" size={250} x="70%" y="50%" delay={1.5} />
      <FloatingOrb color="#ffd79f" size={200} x="40%" y="80%" delay={3} />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="h-px w-12 bg-gradient-to-r from-[#00d2ff] to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ transformOrigin: 'left' }}
            />
            <p className="text-[11px] text-[#00d2ff] uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              Weather Intelligence
            </p>
          </div>
          <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>
            {weather ? (
              <><span className="gradient-text">{weather.city}</span> <span className="text-white/40">Weather</span></>
            ) : (
              <>Weather <span className="gradient-text">Intelligence</span></>
            )}
          </h1>
          <p className="text-[#859399] text-sm lg:text-base max-w-lg">
            {weather ? `${weather.condition} — driving real-time menu optimization.` : 'Search any city to get AI-powered menu recommendations.'}
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card rounded-2xl p-1.5 max-w-2xl"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#859399]" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search city..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-[#859399]/50 focus:outline-none focus:border-[#00d2ff]/30 focus:ring-1 focus:ring-[#00d2ff]/20 transition-all duration-300"
              />
              {isFocused && (
                <motion.div
                  className="absolute inset-0 rounded-xl border border-[#00d2ff]/20 pointer-events-none"
                  layoutId="search-glow"
                  style={{ boxShadow: '0 0 20px rgba(0,210,255,0.1)' }}
                />
              )}
            </div>
            <motion.button
              onClick={handleSearch}
              disabled={loading || !city.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#1fe19e] text-[#003543] text-sm font-bold hover:shadow-lg hover:shadow-[#00d2ff]/20 disabled:opacity-50 transition-shadow duration-300 flex items-center gap-2"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Loader2 className="w-4 h-4" />
                </motion.div>
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </motion.button>
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
        </motion.div>

        <AnimatePresence mode="wait">
          {weather ? (
            <motion.div
              key={weather.city}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main weather hero */}
                <div className="lg:col-span-8">
                  <motion.div
                    className="glass-card rounded-3xl overflow-hidden group relative"
                    whileHover={{ scale: 1.005 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute -inset-8 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `${impactColor}08` }} />

                    <div className="relative z-10">
                      <div className="h-1 w-full bg-gradient-to-r from-[#00d2ff] via-[#1fe19e] to-[#00d2ff]" />
                      <div className="p-8 lg:p-10">
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <motion.div
                              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00d2ff] to-[#1fe19e] flex items-center justify-center shadow-lg shadow-[#00d2ff]/20"
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                              <ConditionIcon condition={weather.condition} size={28} />
                            </motion.div>
                            <div>
                              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>{weather.city}</h2>
                              <p className="text-[#859399] text-sm">{weather.country}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1fe19e]/10 border border-[#1fe19e]/20">
                            <motion.div className="w-2 h-2 rounded-full bg-[#1fe19e]" animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                            <span className="text-[11px] text-[#1fe19e] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>LIVE</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-6 mb-10">
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                              <motion.span className="text-8xl lg:text-9xl font-extrabold gradient-text leading-none" style={{ fontFamily: 'var(--font-montserrat)' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                                {weather.temperature}
                              </motion.span>
                              <span className="text-3xl text-[#859399] font-light">°C</span>
                            </div>
                            <motion.p className="text-[#859399] text-lg mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                              {weather.condition}
                            </motion.p>
                          </div>
                          <ConditionIcon condition={weather.condition} size={64} />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { label: 'Feels Like', value: `${weather.feelsLike}°C`, color: '#00d2ff' },
                            { label: 'Humidity', value: `${weather.humidity}%`, color: '#00d2ff' },
                            { label: 'Wind', value: `${weather.windSpeed} m/s`, color: '#1fe19e' },
                            { label: 'Units', value: weather.units === 'metric' ? 'Metric' : 'Imperial', color: '#ffd79f' },
                          ].map((stat, i) => (
                            <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center group/stat hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
                              <p className="text-white text-lg font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>{stat.value}</p>
                              <p className="text-[9px] text-[#859399] uppercase tracking-wider mt-1" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{stat.label}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Impact sidebar */}
                <div className="lg:col-span-4">
                  <motion.div className="glass-card rounded-3xl overflow-hidden group relative h-full" whileHover={{ scale: 1.005 }} transition={{ duration: 0.3 }}>
                    <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `${impactColor}10` }} />

                    <div className="relative z-10 p-6 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${impactColor}, ${impactColor}80)`, boxShadow: `0 8px 20px ${impactColor}20` }}>
                          <span className="text-[#003543] text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>AI</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>Business Impact</p>
                          <p className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>AI analysis</p>
                        </div>
                      </div>

                      {impact && (
                        <div className="flex-1 flex flex-col">
                          <div className="relative mb-6">
                            <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${impactColor}60, ${impactColor})` }}
                                initial={{ width: '0%' }}
                                animate={{ width: impact === 'high' ? '90%' : impact === 'medium' ? '55%' : '25%' }}
                                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                              />
                            </div>
                            <div className="flex justify-between mt-1.5">
                              <span className="text-[8px] text-[#859399] uppercase" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Low</span>
                              <span className="text-[8px] text-[#859399] uppercase" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>High</span>
                            </div>
                          </div>

                          <motion.div className="p-5 rounded-2xl mb-4" style={{ background: `${impactColor}08`, border: `1px solid ${impactColor}15` }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
                            <p className="text-3xl font-extrabold mb-1" style={{ fontFamily: 'var(--font-montserrat)', color: impactColor }}>
                              {impact.charAt(0).toUpperCase() + impact.slice(1)}
                            </p>
                            <p className="text-[#859399] text-xs uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Impact level</p>
                          </motion.div>

                          <p className="text-[#859399] text-sm leading-relaxed flex-1">
                            {IMPACT_MESSAGES[impact]}
                          </p>

                          <div className="mt-6 space-y-2">
                            <p className="text-[10px] text-[#859399] uppercase tracking-wider font-semibold mb-3" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Suggested actions</p>
                            {IMPACT_ACTIONS[impact].map((action, i) => (
                              <motion.div key={action} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.1 }} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300 cursor-pointer group/action">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 group-hover/action:scale-110 transition-transform" style={{ background: `${impactColor}12` }}>
                                  <span className="text-[9px] font-bold" style={{ fontFamily: 'var(--font-jetbrains-mono)', color: impactColor }}>{i + 1}</span>
                                </div>
                                <span className="text-[12px] text-white/70 group-hover/action:text-white transition-colors">{action}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card rounded-3xl p-16 text-center relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ background: ['radial-gradient(ellipse at 20% 50%, rgba(0,210,255,0.03) 0%, transparent 60%)', 'radial-gradient(ellipse at 80% 50%, rgba(31,225,158,0.03) 0%, transparent 60%)', 'radial-gradient(ellipse at 20% 50%, rgba(0,210,255,0.03) 0%, transparent 60%)'] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
              <div className="relative z-10">
                <motion.div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                  <Cloud className="w-10 h-10 text-[#859399]" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-montserrat)' }}>Search for a city</h3>
                <p className="text-[#859399] text-sm max-w-sm mx-auto mb-8">Get real-time weather analysis and AI-powered menu optimization suggestions.</p>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {SUGGESTED_CITIES.map((c) => (
                    <motion.button
                      key={c}
                      onClick={() => { setCity(c); fetchWeather(c); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#859399] text-xs font-medium hover:bg-white/[0.08] hover:border-white/[0.15] hover:text-white transition-all duration-300"
                    >
                      {c}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
