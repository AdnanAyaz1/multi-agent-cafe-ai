'use client';

import { Coffee, Sparkles, Bot, BotOff, Eye, EyeOff } from 'lucide-react';
import { CATEGORY_CONFIG, TAG_COLORS } from '@/constants/menu-display';
import { MENU_CATEGORY_ICON_MAP } from '@/constants/icons';
import { Toggle } from '@/components/ui/Toggle';
import type { MenuItemCardProps } from '@/types/dashboard-home';

export function MenuItemCard({ item, isControlled, isUnavailable, onToggleControlled, onToggleUnavailable }: MenuItemCardProps) {
  const cat = CATEGORY_CONFIG[item.category];
  const CatIcon = MENU_CATEGORY_ICON_MAP[cat.icon] ?? Coffee;
  const isSignature = item.tags?.includes('signature');

  return (
    <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-150 ${isUnavailable ? 'opacity-50' : ''}`}>
      <div className="relative z-10 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color}12`, border: `1px solid ${cat.color}18` }}>
            <CatIcon className="w-5 h-5" style={{ color: cat.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white text-sm font-bold truncate">{item.name}</h3>
              {isSignature && <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
            </div>
            <p className="text-zinc-400 text-[10px] uppercase tracking-wider">{cat.label}</p>
          </div>
          <p className="text-lg font-extrabold text-white flex-shrink-0">{item.price}</p>
        </div>

        {item.description && <p className="text-zinc-400 text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>}

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.tags.map((tag) => (
              <span key={tag} className="text-[8px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider" style={{ color: TAG_COLORS[tag] ?? '#a1a1aa', background: `${TAG_COLORS[tag] ?? '#a1a1aa'}10`, border: `1px solid ${TAG_COLORS[tag] ?? '#a1a1aa'}15` }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-3 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isControlled ? <Bot className="w-3.5 h-3.5 text-green-500" /> : <BotOff className="w-3.5 h-3.5 text-zinc-500" />}
              <span className="text-xs text-zinc-400">AI Control</span>
            </div>
            <Toggle enabled={isControlled} onToggle={onToggleControlled} color="#22c55e" size="sm" />
          </div>
          {isControlled && (
            <p className="text-[9px] text-green-500/60 pl-5">
              AI can suggest price changes &amp; promos
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isUnavailable ? <EyeOff className="w-3.5 h-3.5 text-zinc-500" /> : <Eye className="w-3.5 h-3.5 text-[#e07850]" />}
              <span className="text-xs text-zinc-400">Available</span>
            </div>
            <Toggle enabled={!isUnavailable} onToggle={onToggleUnavailable} color="#3b82f6" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
