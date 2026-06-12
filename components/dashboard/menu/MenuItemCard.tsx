'use client';

import { motion } from 'framer-motion';
import { Coffee, IceCreamBowl, Sandwich, CakeSlice, Sparkles, Bot, BotOff, Eye, EyeOff } from 'lucide-react';
import { CATEGORY_CONFIG, TAG_COLORS } from '@/constants/menu-display';
import { Toggle } from '@/components/ui/Toggle';
import type { MenuItemCardProps } from '@/types/dashboard-home';

const ICON_MAP: Record<string, typeof Coffee> = { Coffee, IceCreamBowl, Sandwich, CakeSlice };

export function MenuItemCard({ item, isControlled, isUnavailable, onToggleControlled, onToggleUnavailable, index }: MenuItemCardProps) {
  const cat = CATEGORY_CONFIG[item.category];
  const CatIcon = ICON_MAP[cat.icon] ?? Coffee;
  const isSignature = item.tags?.includes('signature');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-card rounded-2xl overflow-hidden group relative transition-all duration-300 ${isUnavailable ? 'opacity-50' : ''}`}
    >
      {isSignature && <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-[25px] pointer-events-none bg-[#ffd79f]/10" />}

      <div className="relative z-10 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color}12`, border: `1px solid ${cat.color}18` }}>
            <CatIcon className="w-5 h-5" style={{ color: cat.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white text-sm font-bold truncate" style={{ fontFamily: 'var(--font-montserrat)' }}>{item.name}</h3>
              {isSignature && <Sparkles className="w-3.5 h-3.5 text-[#ffd79f] flex-shrink-0" />}
            </div>
            <p className="text-[#859399] text-[10px] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{cat.label}</p>
          </div>
          <p className="text-lg font-extrabold gradient-text flex-shrink-0" style={{ fontFamily: 'var(--font-montserrat)' }}>{item.price}</p>
        </div>

        {item.description && <p className="text-[#859399] text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>}

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.tags.map((tag) => (
              <span key={tag} className="text-[8px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)', color: TAG_COLORS[tag] ?? '#859399', background: `${TAG_COLORS[tag] ?? '#859399'}10`, border: `1px solid ${TAG_COLORS[tag] ?? '#859399'}15` }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-3 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isControlled ? <Bot className="w-3.5 h-3.5 text-[#1fe19e]" /> : <BotOff className="w-3.5 h-3.5 text-[#859399]/40" />}
              <span className="text-xs text-[#859399]">AI Control</span>
            </div>
            <Toggle enabled={isControlled} onToggle={onToggleControlled} color="#1fe19e" size="sm" />
          </div>
          {isControlled && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-[9px] text-[#1fe19e]/60 pl-5" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              AI can suggest price changes &amp; promos
            </motion.p>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isUnavailable ? <EyeOff className="w-3.5 h-3.5 text-[#859399]/40" /> : <Eye className="w-3.5 h-3.5 text-[#00d2ff]" />}
              <span className="text-xs text-[#859399]">Available</span>
            </div>
            <Toggle enabled={!isUnavailable} onToggle={onToggleUnavailable} color="#00d2ff" size="sm" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
