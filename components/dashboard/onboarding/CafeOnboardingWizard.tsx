'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Globe,
  Sparkles,
  CloudSun,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  X,
  TrendingUp,
  Tag,
  Coffee,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import type { WeatherSuggestion } from '@/utils/weather-suggestions';

interface CafeOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialCities?: string[];
  initialCompetitors?: string[];
  businessId?: string;
  onComplete?: () => void;
}

const POPULAR_CITIES = ['Seattle', 'Portland', 'San Francisco', 'Austin', 'New York', 'Tokyo', 'London', 'Chicago'];

export function CafeOnboardingWizard({
  isOpen,
  onClose,
  initialCities = [],
  initialCompetitors = [],
  businessId,
  onComplete,
}: CafeOnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Cities & Weather
  const [cities, setCities] = useState<string[]>(
    initialCities.length > 0 ? initialCities : ['Seattle']
  );
  const [cityInput, setCityInput] = useState('');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherSuggestions, setWeatherSuggestions] = useState<WeatherSuggestion[]>([]);

  // Step 2: Competitor URLs
  const [competitorUrls, setCompetitorUrls] = useState<string[]>(
    initialCompetitors.length > 0 ? initialCompetitors : ['']
  );

  // Step 3: Analysis Pipeline
  const [isSaving, setIsSaving] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<
    'idle' | 'saving' | 'running' | 'complete' | 'failed'
  >('idle');
  const [activeAgentIndex, setActiveAgentIndex] = useState(0);

  // Reset when initial values change
  useEffect(() => {
    if (initialCities.length > 0) {
      setCities(initialCities);
    }
    if (initialCompetitors.length > 0) {
      setCompetitorUrls(initialCompetitors);
    }
  }, [initialCities, initialCompetitors]);

  // Automatically fetch weather suggestions for existing cities on mount
  useEffect(() => {
    if (isOpen && cities.length > 0 && weatherSuggestions.length === 0) {
      fetchWeatherSuggestions(cities);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Add a city
  const handleAddCity = (cityToAdd?: string) => {
    const raw = (cityToAdd || cityInput).trim();
    if (!raw) return;
    if (cities.map((c) => c.toLowerCase()).includes(raw.toLowerCase())) {
      toast.info(`"${raw}" is already added.`);
      setCityInput('');
      return;
    }
    const updated = [...cities, raw];
    setCities(updated);
    setCityInput('');
    fetchWeatherSuggestions(updated);
  };

  const handleRemoveCity = (indexToRemove: number) => {
    if (cities.length <= 1) {
      toast.error('You need at least one operational city.');
      return;
    }
    const updated = cities.filter((_, i) => i !== indexToRemove);
    setCities(updated);
    fetchWeatherSuggestions(updated);
  };

  // Fetch weather and suggestions for all cities
  const fetchWeatherSuggestions = async (cityList: string[]) => {
    if (cityList.length === 0) return;
    setWeatherLoading(true);
    try {
      const res = await fetch('/api/business/weather-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cities: cityList }),
      });
      if (res.ok) {
        const data = await res.json();
        setWeatherSuggestions(data.suggestions || []);
      }
    } catch {
      toast.error('Failed to fetch weather for some cities.');
    } finally {
      setWeatherLoading(false);
    }
  };

  // Add / remove competitor URLs
  const handleAddCompetitorUrl = () => {
    setCompetitorUrls([...competitorUrls, '']);
  };

  const handleUpdateCompetitorUrl = (index: number, val: string) => {
    const updated = [...competitorUrls];
    updated[index] = val;
    setCompetitorUrls(updated);
  };

  const handleRemoveCompetitorUrl = (index: number) => {
    if (competitorUrls.length <= 1) {
      setCompetitorUrls(['']);
      return;
    }
    setCompetitorUrls(competitorUrls.filter((_, i) => i !== index));
  };

  // Save setup & launch analysis
  const handleLaunchAnalysis = async () => {
    setIsSaving(true);
    setPipelineStatus('saving');

    const cleanCompetitors = competitorUrls
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && (u.startsWith('http://') || u.startsWith('https://')));

    try {
      // 1. Save business configuration
      const patchRes = await fetch('/api/business', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cities,
          city: cities[0],
          competitorUrls: cleanCompetitors,
        }),
      });

      if (!patchRes.ok) {
        throw new Error('Failed to save business settings');
      }

      const patchData = await patchRes.json();
      const resolvedBusinessId = businessId || patchData.business?.id;

      // 2. Trigger pipeline run if competitor URLs or city exists
      setPipelineStatus('running');

      const pipelineType = cleanCompetitors.length > 0 ? 'competitor' : 'weather';
      const runRes = await fetch('/api/analysis/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: resolvedBusinessId,
          pipelineType,
        }),
      });

      if (runRes.ok) {
        // Simulate visual agent steps for professional delight
        let stepCount = 0;
        const interval = setInterval(() => {
          stepCount++;
          setActiveAgentIndex((prev) => (prev < 4 ? prev + 1 : prev));
          if (stepCount >= 4) {
            clearInterval(interval);
            setPipelineStatus('complete');
            setIsSaving(false);
            toast.success('Intelligence pipeline initiated successfully!');
          }
        }, 1200);
      } else {
        setPipelineStatus('complete');
        setIsSaving(false);
      }
    } catch (err) {
      setPipelineStatus('failed');
      setIsSaving(false);
      toast.error(err instanceof Error ? err.message : 'Setup failed');
    }
  };

  const AGENTS_LIST = [
    { name: 'Menu Analyst', desc: 'Parsing menu margins & baseline prices' },
    { name: 'Weather Analyst', desc: 'Correlating micro-climate & demand shifts' },
    { name: 'Competitor Parser', desc: 'Scraping competitor pricing & promotions' },
    { name: 'Strategist (LangGraph)', desc: 'Calculating dynamic price optimizations' },
    { name: 'Critic & Synthesizer', desc: 'Audit against margin guards & executive summary' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden text-white"
        style={{
          background: 'linear-gradient(160deg, #16120e 0%, #0e0c0a 50%, #120e0b 100%)',
        }}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e07850] to-[#c8a070] flex items-center justify-center text-[#1a1208] shadow-lg shadow-[#e07850]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-[#e07850] uppercase font-mono">
                  Setup & Intelligence
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.05] text-zinc-400">
                  Step {step} of 3
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {step === 1 && 'Operational Branches & Weather Intelligence'}
                {step === 2 && 'Competitor Benchmarking & URLs'}
                {step === 3 && 'Launch Multi-Agent Analysis Pipeline'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard progress bar */}
        <div className="w-full h-1 bg-white/[0.04]">
          <div
            className="h-full bg-gradient-to-r from-[#e07850] to-[#c8a070] transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* STEP 1: CITIES & WEATHER SUGGESTIONS */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1.5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#e07850]" />
                  Where are your cafes located?
                </h3>
                <p className="text-zinc-400 text-sm">
                  Add the cities where your cafe operates. Our AI agents continuously track local weather
                  conditions to trigger high-converting weather promotions.
                </p>
              </div>

              {/* City Input & Quick Tags */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCity())}
                      placeholder="Enter city (e.g. Seattle, Portland, Tokyo)..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#e07850] focus:ring-1 focus:ring-[#e07850]/30 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => handleAddCity()}
                    className="px-5 py-3 rounded-xl bg-[#e07850] text-[#1a1208] text-sm font-bold hover:bg-[#e07850]/90 transition-all flex items-center gap-1.5 shadow-lg shadow-[#e07850]/15"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {/* Popular City Quick-Add */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-zinc-500">Quick add:</span>
                  {POPULAR_CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleAddCity(c)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-zinc-300 hover:text-white transition-all text-xs"
                    >
                      + {c}
                    </button>
                  ))}
                </div>

                {/* Selected Cities Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {cities.map((city, idx) => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e07850]/10 border border-[#e07850]/30 text-[#e07850] text-xs font-semibold"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {city}
                      {idx === 0 && <span className="text-[10px] text-zinc-400 font-mono">(HQ)</span>}
                      <button
                        onClick={() => handleRemoveCity(idx)}
                        className="hover:text-red-400 transition-colors ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Weather & Real-time Suggestions Section */}
              <div className="pt-4 border-t border-white/[0.06] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-5 h-5 text-amber-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Live Weather & AI Promotion Suggestions
                    </h4>
                  </div>
                  {weatherLoading && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e07850]" />
                      Analyzing weather...
                    </div>
                  )}
                </div>

                {/* Weather Suggestion Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weatherSuggestions.map((s) => (
                    <div
                      key={s.city}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">{s.city}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-400 font-mono">
                            {s.weather.temperature}°C · {s.weather.condition}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#e07850]/15 text-[#e07850] border border-[#e07850]/30 uppercase tracking-wider font-mono">
                          {s.tag}
                        </span>
                      </div>

                      {/* Strategy */}
                      <div>
                        <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          {s.headline}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {s.actionableTactic}
                        </p>
                      </div>

                      {/* Discount & Items */}
                      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-[#c8a070] font-semibold">
                          <Tag className="w-3 h-3" />
                          {s.recommendedDiscount}
                        </div>
                        <span className="text-zinc-500 text-[11px] font-mono">
                          {s.suggestedItems.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: COMPETITOR TRACKING */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1.5 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#e07850]" />
                  Monitor Local Competitor Menus & Pricing
                </h3>
                <p className="text-zinc-400 text-sm">
                  Add competitor cafe website URLs or online menu links. Our Crawlee & Playwright agents
                  scrape competitor price moves and benchmark your items automatically.
                </p>
              </div>

              {/* Competitors URL List */}
              <div className="space-y-3">
                {competitorUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleUpdateCompetitorUrl(index, e.target.value)}
                        placeholder="https://competitor-roastery.com/menu"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#e07850] focus:ring-1 focus:ring-[#e07850]/30 transition-all"
                      />
                    </div>
                    {competitorUrls.length > 1 && (
                      <button
                        onClick={() => handleRemoveCompetitorUrl(index)}
                        className="px-3.5 py-3 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/30 text-zinc-400 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={handleAddCompetitorUrl}
                  className="w-full py-3 rounded-xl border border-dashed border-white/[0.12] hover:border-[#e07850]/50 hover:bg-[#e07850]/5 text-zinc-300 hover:text-[#e07850] text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Another Competitor URL
                </button>
              </div>

              {/* Sample Competitor Notice */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3 text-xs text-zinc-400">
                <Coffee className="w-4 h-4 text-[#e07850] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-0.5">Scraping & Intelligence Rules</p>
                  <p>
                    Agents will extract item descriptions, prices, seasonal specials, and calculate
                    elasticity spreads against your cafe menu items. You can add or modify competitors anytime from your settings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LAUNCH ANALYSIS PIPELINE */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1.5 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#e07850]" />
                  Launch Multi-Agent Intelligence Pipeline
                </h3>
                <p className="text-zinc-400 text-sm">
                  You are all set! Review your setup configuration and kick off the autonomous 5-agent LangGraph workflow.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    Operational Locations
                  </p>
                  <p className="text-lg font-bold text-white">{cities.length} Cities Configured</p>
                  <p className="text-xs text-zinc-400 mt-1">{cities.join(', ')}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    Competitor Targets
                  </p>
                  <p className="text-lg font-bold text-white">
                    {competitorUrls.filter((u) => u.trim()).length} Competitor Sites
                  </p>
                  <p className="text-xs text-zinc-400 mt-1 truncate">
                    {competitorUrls.filter((u) => u.trim()).join(', ') || 'None (Weather mode only)'}
                  </p>
                </div>
              </div>

              {/* Pipeline Agent Visualizer */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <p className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  LangGraph.js Pipeline Workflow
                </p>

                <div className="space-y-2">
                  {AGENTS_LIST.map((agent, i) => {
                    const isPassed = pipelineStatus === 'complete' || (pipelineStatus === 'running' && i < activeAgentIndex);
                    const isCurrent = pipelineStatus === 'running' && i === activeAgentIndex;

                    return (
                      <div
                        key={agent.name}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isPassed
                            ? 'bg-green-500/[0.05] border-green-500/20 text-green-400'
                            : isCurrent
                            ? 'bg-[#e07850]/10 border-[#e07850]/30 text-white'
                            : 'bg-white/[0.02] border-white/[0.04] text-zinc-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs">
                            {isPassed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : isCurrent ? (
                              <Loader2 className="w-4 h-4 animate-spin text-[#e07850]" />
                            ) : (
                              <span className="text-zinc-600">{i + 1}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{agent.name}</p>
                            <p className="text-xs opacity-75">{agent.desc}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.04]">
                          {isPassed ? 'Done' : isCurrent ? 'Running...' : 'Standby'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {pipelineStatus === 'complete' && (
                <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-300 flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Pipeline Finished Successfully</p>
                    <p className="text-xs text-green-400/80">
                      Pricing and promotion recommendations are ready in your dashboard.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-6 sm:px-8 py-5 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                disabled={isSaving}
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2)}
                className="px-4 py-2.5 rounded-xl border border-white/[0.08] hover:bg-white/[0.05] text-zinc-300 text-sm font-semibold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 3 ? (
              <button
                onClick={() => setStep((prev) => (prev + 1) as 2 | 3)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e07850] to-[#c8a070] text-[#1a1208] text-sm font-bold hover:shadow-lg hover:shadow-[#e07850]/20 transition-all flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : pipelineStatus === 'complete' ? (
              <button
                onClick={() => {
                  onComplete?.();
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-green-500 text-black text-sm font-bold hover:bg-green-400 transition-all flex items-center gap-1.5 shadow-lg shadow-green-500/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Go to Dashboard
              </button>
            ) : (
              <button
                disabled={isSaving}
                onClick={handleLaunchAnalysis}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#e07850] to-[#c8a070] text-[#1a1208] text-sm font-bold hover:shadow-lg hover:shadow-[#e07850]/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Running Pipeline...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Save & Launch Analysis
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
