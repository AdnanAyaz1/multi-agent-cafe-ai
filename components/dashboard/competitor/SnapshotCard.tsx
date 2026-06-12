'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, Clock, Hash } from 'lucide-react';
import { formatTimestamp } from '@/lib/format';
import type { Snapshot } from '@/hooks/useCompetitorSnapshots';

export function SnapshotCard({ snapshot, index }: { snapshot: Snapshot; index: number }) {
  const data = snapshot.data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-3xl overflow-hidden group relative"
    >
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[#00d2ff]/5" />

      <div className="relative z-10">
        <div className="p-6 pb-4 border-b border-white/[0.04]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-white truncate" style={{ fontFamily: 'var(--font-montserrat)' }}>{data.brand ?? 'Unbranded competitor'}</h3>
                <span className="flex-shrink-0 text-[9px] px-2.5 py-1 rounded-full bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/15" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{data.items.length} items</span>
                {data.promos.length > 0 && <span className="flex-shrink-0 text-[9px] px-2.5 py-1 rounded-full bg-[#1fe19e]/10 text-[#1fe19e] border border-[#1fe19e]/15" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{data.promos.length} promos</span>}
              </div>
              <a href={data.finalUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-xs text-[#859399] hover:text-[#00d2ff] transition-colors truncate max-w-full">
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{data.finalUrl}</span>
              </a>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-[9px] text-[#859399]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                <Clock className="w-3 h-3" />
                <time dateTime={snapshot.collectedAt}>{formatTimestamp(snapshot.collectedAt)}</time>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-[#859399]/60" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                <Hash className="w-3 h-3" />
                <span>expires {formatTimestamp(snapshot.expiresAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {data.items.length > 0 && (
          <div className="p-6">
            <p className="text-[10px] text-[#859399] uppercase tracking-wider font-semibold mb-3" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Menu Items</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left py-2 text-[9px] text-[#859399] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Item</th>
                    <th className="text-left py-2 text-[9px] text-[#859399] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Category</th>
                    <th className="text-right py-2 text-[9px] text-[#859399] uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, i) => (
                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 text-white font-medium">{item.name}</td>
                      <td className="py-2.5 text-[#859399] text-xs">{item.category ?? '—'}</td>
                      <td className="py-2.5 text-right">{item.price != null ? <span className="text-[#1fe19e] font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>{item.currency ?? '$'}{item.price}</span> : <span className="text-[#859399]/40">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data.promos.length > 0 && (
          <div className="px-6 pb-4">
            <p className="text-[10px] text-[#859399] uppercase tracking-wider font-semibold mb-3" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Active Promos</p>
            <div className="space-y-2">
              {data.promos.map((promo, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#1fe19e]/[0.03] border border-[#1fe19e]/[0.06]">
                  <Sparkles className="w-4 h-4 text-[#1fe19e] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{promo.text}</p>
                    {promo.validUntil && <p className="text-[#859399] text-[10px] mt-0.5" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Valid until {formatTimestamp(promo.validUntil)}</p>}
                  </div>
                  {promo.discountPercent != null && <span className="text-[10px] text-[#1fe19e] font-bold px-2 py-0.5 rounded-full bg-[#1fe19e]/10" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>-{promo.discountPercent}%</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.notes.length > 0 && (
          <div className="px-6 pb-6">
            <p className="text-[10px] text-[#859399] uppercase tracking-wider font-semibold mb-3" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>AI Notes</p>
            <ul className="space-y-1.5">
              {data.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#859399]">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-[#859399]/30 flex-shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
