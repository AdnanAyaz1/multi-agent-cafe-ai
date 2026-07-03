import { Globe, ExternalLink, Sparkles, Tag, BarChart3 } from 'lucide-react';
import type { CompetitorData } from '@/lib/types';

interface CompetitorSummaryProps {
  data: CompetitorData;
  collectedAt: string;
}

export function CompetitorSummary({ data, collectedAt }: CompetitorSummaryProps) {
  const categories = [...new Set(data.items.map((i) => i.category).filter(Boolean))];
  const pricedItems = data.items.filter((i) => i.price != null);
  const avgPrice = pricedItems.length > 0
    ? pricedItems.reduce((sum, i) => sum + (i.price ?? 0), 0) / pricedItems.length
    : null;
  const promoCount = data.promos.length;

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="relative z-10">
        {/* Header */}
        <div className="p-6 lg:p-8 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#e07850]/10 border border-[#e07850]/20 flex items-center justify-center">
              <Globe className="w-6 h-6 text-[#e07850]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-lg font-bold truncate">{data.brand ?? 'Unknown Competitor'}</p>
              <a
                href={data.finalUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#e07850] transition-colors duration-150 truncate max-w-full"
              >
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{data.finalUrl}</span>
              </a>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[9px] text-zinc-500 font-mono">Scraped {new Date(collectedAt).toLocaleTimeString()}</span>
              <span className="text-[9px] text-zinc-600 font-mono">{data.items.length} items</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 flex-wrap">
            {avgPrice != null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300">
                <Tag className="w-3 h-3 text-zinc-400" />
                Avg ${avgPrice.toFixed(2)}
              </span>
            )}
            {categories.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300">
                <BarChart3 className="w-3 h-3 text-zinc-400" />
                {categories.length} categories
              </span>
            )}
            {promoCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-500">
                <Sparkles className="w-3 h-3" />
                {promoCount} active promo{promoCount === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 lg:p-8 space-y-6">
          {/* Items preview */}
          {data.items.length > 0 && (
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-3 font-mono">Menu Snapshot</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.items.slice(0, 8).map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      {item.category && <p className="text-zinc-500 text-[10px]">{item.category}</p>}
                    </div>
                    {item.price != null ? (
                      <span className="text-green-500 text-xs font-bold font-mono flex-shrink-0">
                        {item.currency ?? '$'}{item.price}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs font-mono flex-shrink-0">—</span>
                    )}
                  </div>
                ))}
              </div>
              {data.items.length > 8 && (
                <p className="text-zinc-500 text-[10px] mt-2 font-mono">+{data.items.length - 8} more items</p>
              )}
            </div>
          )}

          {/* Promos */}
          {data.promos.length > 0 && (
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-3 font-mono">Active Promotions</p>
              <div className="space-y-2">
                {data.promos.map((promo, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/5 border border-green-500/10">
                    <Sparkles className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{promo.text}</p>
                      {promo.validUntil && <p className="text-zinc-500 text-[10px] mt-0.5">Valid until {promo.validUntil}</p>}
                    </div>
                    {promo.discountPercent != null && (
                      <span className="text-[10px] text-green-500 font-bold font-mono px-2 py-0.5 rounded-full bg-green-500/10 flex-shrink-0">
                        -{promo.discountPercent}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {data.notes.length > 0 && (
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-3 font-mono">Intelligence Notes</p>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <ul className="space-y-2">
                  {data.notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-500 flex-shrink-0" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
