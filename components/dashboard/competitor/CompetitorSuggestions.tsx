'use client';

import { TrendingDown, TrendingUp, AlertTriangle, Target, Lightbulb, Sparkles } from 'lucide-react';
import type { CompetitorData } from '@/lib/types';
import type { CompetitorSnapshot as Snapshot } from '@/types/analysis';

interface Suggestion {
  id: string;
  type: 'pricing' | 'promo' | 'gap' | 'opportunity';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

function deriveSuggestions(snapshots: Snapshot[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const latest = snapshots[0]?.data;
  if (!latest) return suggestions;

  // Promo-based suggestions
  if (latest.promos.length > 0) {
    suggestions.push({
      id: 'active-promos',
      type: 'promo',
      title: 'Competitor Running Promotions',
      description: `${latest.brand ?? 'This competitor'} has ${latest.promos.length} active promotion${latest.promos.length === 1 ? '' : 's'}. Consider matching or differentiating your offers.`,
      severity: 'high',
    });
  }

  // Pricing insights
  const pricedItems = latest.items.filter((i) => i.price != null);
  if (pricedItems.length > 0) {
    const avgPrice = pricedItems.reduce((s, i) => s + (i.price ?? 0), 0) / pricedItems.length;
    const expensive = pricedItems.filter((i) => (i.price ?? 0) > avgPrice * 1.3);
    const cheap = pricedItems.filter((i) => (i.price ?? 0) < avgPrice * 0.7);

    if (expensive.length > 0) {
      suggestions.push({
        id: 'premium-items',
        type: 'pricing',
        title: 'Premium Price Points Detected',
        description: `${expensive.length} item${expensive.length === 1 ? '' : 's'} priced 30%+ above average ($${avgPrice.toFixed(2)} avg). These could be margin opportunities or overpriced targets.`,
        severity: 'medium',
      });
    }

    if (cheap.length > 0) {
      suggestions.push({
        id: 'budget-items',
        type: 'pricing',
        title: 'Budget-Friendly Items',
        description: `${cheap.length} item${cheap.length === 1 ? '' : 's'} priced 30%+ below average. These may be loss leaders or volume drivers to watch.`,
        severity: 'low',
      });
    }
  }

  // Category gaps
  const categories = [...new Set(latest.items.map((i) => i.category).filter(Boolean))];
  if (categories.length > 0) {
    suggestions.push({
      id: 'category-spread',
      type: 'gap',
      title: `${categories.length} Categories Covered`,
      description: `Competitor spans: ${categories.join(', ')}. Review if you have gaps in any of these areas.`,
      severity: categories.length > 4 ? 'medium' : 'low',
    });
  }

  // Notes-based opportunities
  if (latest.notes.length > 0) {
    suggestions.push({
      id: 'ai-notes',
      type: 'opportunity',
      title: 'AI Observations',
      description: latest.notes[0],
      severity: 'low',
    });
  }

  // Multi-snapshot trend
  if (snapshots.length >= 2) {
    const prev = snapshots[1].data;
    const prevItemCount = prev.items.length;
    const currItemCount = latest.items.length;
    if (currItemCount !== prevItemCount) {
      suggestions.push({
        id: 'menu-change',
        type: 'opportunity',
        title: 'Menu Size Changed',
        description: `Menu went from ${prevItemCount} to ${currItemCount} items (${currItemCount > prevItemCount ? '+' : ''}${currItemCount - prevItemCount}).`,
        severity: currItemCount > prevItemCount ? 'medium' : 'low',
      });
    }
  }

  return suggestions;
}

const TYPE_CONFIG = {
  pricing: { icon: TrendingDown, color: 'text-[#e07850]', bg: 'bg-[#e07850]/10', border: 'border-[#e07850]/20' },
  promo: { icon: Sparkles, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  gap: { icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  opportunity: { icon: Lightbulb, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
} as const;

const SEVERITY_CONFIG = {
  high: { icon: AlertTriangle, color: 'text-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
  medium: { icon: TrendingUp, color: 'text-amber-500', badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  low: { icon: Lightbulb, color: 'text-zinc-400', badge: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
} as const;

interface CompetitorSuggestionsProps {
  snapshots: Snapshot[];
}

export function CompetitorSuggestions({ snapshots }: CompetitorSuggestionsProps) {
  const suggestions = deriveSuggestions(snapshots);

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold font-mono">Competitive Insights</p>
        <span className="text-[9px] text-zinc-500 font-mono">· Derived from {snapshots.length} snapshot{snapshots.length === 1 ? '' : 's'}</span>
      </div>

      {suggestions.map((suggestion) => {
        const typeCfg = TYPE_CONFIG[suggestion.type];
        const sevCfg = SEVERITY_CONFIG[suggestion.severity];
        const TypeIcon = typeCfg.icon;

        return (
          <div
            key={suggestion.id}
            className="glass-card rounded-2xl p-4 transition-all duration-150"
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeCfg.bg} border ${typeCfg.border}`}>
                <TypeIcon className={`w-4 h-4 ${typeCfg.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-semibold truncate">{suggestion.title}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${sevCfg.badge}`}>
                    {suggestion.severity}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{suggestion.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
