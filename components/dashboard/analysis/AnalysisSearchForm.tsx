'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Search, Loader2, Sparkles, MapPin, Check, Cloud, Globe } from 'lucide-react';
import type { AnalysisSearchFormProps } from '@/types/component-props';

function formatCompetitorLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const name = host.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return url;
  }
}

export function AnalysisSearchForm({
  form,
  isRunning,
  loading,
  error,
  onSubmit,
  onCancel,
  pipelineType,
  cities = [],
  selectedCity = '',
  onSelectCity,
  weatherPreview,
  weatherLoading = false,
  competitorUrls = [],
  selectedCompetitorUrl = '',
  onSelectCompetitorUrl,
}: AnalysisSearchFormProps) {
  const businessId = form.watch('businessId');

  return (
    <div className="glass-card rounded-2xl p-4 max-w-2xl space-y-4">
      {/* Branch City Selector (for Weather Pipeline) */}
      {pipelineType !== 'competitor' && cities.length > 0 && onSelectCity && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#e07850]" /> Select City Weather to Analyze:
            </span>
            {selectedCity && (
              <span className="text-[11px] font-mono text-[#e07850] bg-[#e07850]/10 px-2 py-0.5 rounded-md border border-[#e07850]/20">
                Target: {selectedCity}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {cities.map((opCity) => {
              const isSelected = selectedCity.toLowerCase() === opCity.toLowerCase();
              return (
                <button
                  key={opCity}
                  type="button"
                  disabled={isRunning}
                  onClick={() => onSelectCity(opCity)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${
                    isSelected
                      ? 'bg-[#e07850] text-[#1a1208] shadow-md shadow-[#e07850]/20 font-bold'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06]'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <MapPin className="w-3 h-3 opacity-60" />
                  )}
                  {opCity}
                </button>
              );
            })}
          </div>

          {/* Real-time Weather Preview for Selected City */}
          {weatherLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-zinc-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e07850]" />
              Checking current weather for {selectedCity}...
            </div>
          ) : weatherPreview ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <Cloud className="w-4 h-4 text-[#e07850]" />
                <span className="font-semibold text-white">{weatherPreview.city} Weather:</span>
                <span>{weatherPreview.temperature}°C</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">{weatherPreview.condition}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">Humidity: {weatherPreview.humidity}%</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Live Data
              </span>
            </div>
          ) : null}
        </div>
      )}

      {/* Competitor Cafe Selector (for Competitor Pipeline) */}
      {pipelineType === 'competitor' && competitorUrls.length > 0 && onSelectCompetitorUrl && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#e07850]" /> Select Competitor Cafe to Benchmark Against:
            </span>
            {selectedCompetitorUrl && (
              <span className="text-[11px] font-mono text-[#e07850] bg-[#e07850]/10 px-2 py-0.5 rounded-md border border-[#e07850]/20 truncate max-w-[220px]">
                Target: {formatCompetitorLabel(selectedCompetitorUrl)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {competitorUrls.map((cUrl) => {
              const isSelected = selectedCompetitorUrl.toLowerCase().trim() === cUrl.toLowerCase().trim();
              const label = formatCompetitorLabel(cUrl);
              return (
                <button
                  key={cUrl}
                  type="button"
                  disabled={isRunning}
                  onClick={() => onSelectCompetitorUrl(cUrl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${
                    isSelected
                      ? 'bg-[#e07850] text-[#1a1208] shadow-md shadow-[#e07850]/20 font-bold'
                      : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06]'
                  }`}
                  title={cUrl}
                >
                  {isSelected ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <Globe className="w-3 h-3 opacity-60" />
                  )}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Submission */}
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            {...form.register('businessId')}
            onKeyDown={(e) => e.key === 'Enter' && !isRunning && onSubmit()}
            placeholder="Enter business ID (e.g. cafe-001)"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#e89070]/30 focus:ring-1 focus:ring-[#e89070]/20 transition-all duration-150"
          />
        </div>
        {isRunning ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/30 transition-all duration-150 flex items-center gap-2 cursor-pointer"
          >
            Stop Pipeline
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || !businessId.trim()}
            className="px-6 py-3 rounded-xl bg-[#e07850] text-white text-sm font-bold hover:bg-[#c86840] disabled:opacity-50 transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-lg shadow-[#e07850]/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {selectedCompetitorUrl
              ? `Run against ${formatCompetitorLabel(selectedCompetitorUrl)}`
              : selectedCity
              ? `Run Pipeline for ${selectedCity}`
              : 'Run Pipeline'}
          </button>
        )}
      </form>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-2 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
