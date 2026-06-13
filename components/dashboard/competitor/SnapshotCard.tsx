'use client';

import { ExternalLink, Sparkles, Clock, Hash } from 'lucide-react';
import { formatTimestamp } from '@/lib/format';
import type { Snapshot } from '@/hooks/useCompetitorSnapshots';

export function SnapshotCard({ snapshot, index }: { snapshot: Snapshot; index: number }) {
  const data = snapshot.data;

  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="relative z-10">
        <div className="p-6 pb-4 border-b border-white/[0.04]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-white truncate">{data.brand ?? 'Unbranded competitor'}</h3>
                <span className="flex-shrink-0 text-[9px] px-2.5 py-1 rounded-full bg-[#e07850]/10 text-[#e07850] border border-[#e07850]/20">{data.items.length} items</span>
                {data.promos.length > 0 && <span className="flex-shrink-0 text-[9px] px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">{data.promos.length} promos</span>}
              </div>
              <a href={data.finalUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#e07850] transition-colors duration-150 truncate max-w-full">
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{data.finalUrl}</span>
              </a>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-400">
                <Clock className="w-3 h-3" />
                <time dateTime={snapshot.collectedAt}>{formatTimestamp(snapshot.collectedAt)}</time>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-500">
                <Hash className="w-3 h-3" />
                <span>expires {formatTimestamp(snapshot.expiresAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {data.items.length > 0 && (
          <div className="p-6">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-3">Menu Items</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-2 text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">Item</th>
                    <th className="text-left py-2 text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">Category</th>
                    <th className="text-right py-2 text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, i) => (
                    <tr key={i} className="border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors duration-150">
                      <td className="py-2.5 text-white font-medium">{item.name}</td>
                      <td className="py-2.5 text-zinc-400 text-xs">{item.category ?? '—'}</td>
                      <td className="py-2.5 text-right">{item.price != null ? <span className="text-green-500 font-bold">{item.currency ?? '$'}{item.price}</span> : <span className="text-zinc-500">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data.promos.length > 0 && (
          <div className="px-6 pb-4">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-3">Active Promos</p>
            <div className="space-y-2">
              {data.promos.map((promo, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                  <Sparkles className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{promo.text}</p>
                    {promo.validUntil && <p className="text-zinc-400 text-[10px] mt-0.5">Valid until {formatTimestamp(promo.validUntil)}</p>}
                  </div>
                  {promo.discountPercent != null && <span className="text-[10px] text-green-500 font-bold px-2 py-0.5 rounded-full bg-green-500/10">-{promo.discountPercent}%</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.notes.length > 0 && (
          <div className="px-6 pb-6">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-3">AI Notes</p>
            <ul className="space-y-1.5">
              {data.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-zinc-500 flex-shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
