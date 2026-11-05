'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, Globe, Sparkles, ExternalLink, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { MOCK_COMPETITORS, COMPETITOR_CHANGE_ICONS } from '@/constants/competitor-display';
import type { CompetitorOverviewProps } from '@/types/dashboard-home';
import { toast } from 'sonner';

export function CompetitorOverview({
  competitorUrls = [],
  businessId,
  onOpenOnboarding,
  onRefreshCompetitors,
}: CompetitorOverviewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTriggerAnalysis = async () => {
    if (!businessId) {
      onOpenOnboarding?.();
      return;
    }
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/analysis/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          pipelineType: 'competitor',
        }),
      });
      if (res.ok) {
        toast.success('Competitor intelligence pipeline started!');
        onRefreshCompetitors?.();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to start competitor pipeline');
      }
    } catch {
      toast.error('Network error triggering competitor pipeline');
    } finally {
      setIsRefreshing(false);
    }
  };

  const hasCompetitors = competitorUrls.length > 0;

  return (
    <div className="dash-glass dash-glow rounded-2xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
              <Eye className="w-4 h-4 text-zinc-400" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Competitor Intelligence</p>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
                Price Benchmark & Menu Watch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all text-xs flex items-center gap-1"
                title="Manage Competitors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleTriggerAnalysis}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#e07850]/10 hover:bg-[#e07850]/20 text-[#e07850] text-xs font-semibold border border-[#e07850]/30 transition-all disabled:opacity-50"
            >
              {isRefreshing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              Run Analysis
            </button>
          </div>
        </div>

        {/* Competitor URLs or Active Feeds */}
        {hasCompetitors ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {competitorUrls.slice(0, 3).map((url, i) => {
                let hostname = url;
                try {
                  hostname = new URL(url).hostname.replace('www.', '');
                } catch {
                  // Fallback
                }
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#e07850]/10 border border-[#e07850]/20 flex items-center justify-center text-[#e07850] flex-shrink-0">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{hostname}</p>
                        <p className="text-[10px] text-zinc-500 truncate max-w-[220px]">{url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        TRACKING
                      </span>
                      <Link
                        href={`/dashboard/competitors?competitorUrl=${encodeURIComponent(url)}`}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#e07850]/15 hover:bg-[#e07850] text-[#e07850] hover:text-[#1a1208] border border-[#e07850]/30 transition-all flex items-center gap-1"
                      >
                        Analyze →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Price movements */}
            <div className="pt-2 border-t border-white/[0.04] space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-mono text-zinc-500">
                Latest Price Deviations
              </p>
              {MOCK_COMPETITORS.slice(0, 2).map((item) => {
                const cfg = COMPETITOR_CHANGE_ICONS[item.change];
                return (
                  <div
                    key={`${item.name}-${item.item}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.015] border border-white/[0.03]"
                  >
                    <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">
                        {item.name} — {item.item}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white text-xs font-semibold font-mono">{item.price}</p>
                      <p className={`text-[9px] font-bold ${cfg.color} font-mono`}>{item.changeAmount}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.08] text-center space-y-3">
            <Globe className="w-8 h-8 text-zinc-600 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-white">No Competitors Configured</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Add nearby competitor websites or menus so our agents can monitor price changes and keep your margins competitive.
              </p>
            </div>
            {onOpenOnboarding && (
              <button
                onClick={onOpenOnboarding}
                className="px-4 py-2 rounded-xl bg-[#e07850] text-[#1a1208] text-xs font-bold hover:bg-[#e07850]/90 transition-all inline-flex items-center gap-1.5 shadow-lg shadow-[#e07850]/15"
              >
                <Plus className="w-3.5 h-3.5" /> Add Competitor Menus
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
