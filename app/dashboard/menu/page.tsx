'use client';

import { useState } from 'react';
import { UtensilsCrossed, Search, RefreshCw, Bot, BotOff, Filter } from 'lucide-react';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useBusinessId } from '@/hooks/useBusinessId';
import { MENU_CATEGORIES, type MenuCategory } from '@/constants/menu';
import { CATEGORY_CONFIG } from '@/constants/menu-display';
import { MenuItemCard } from '@/components/dashboard/menu/MenuItemCard';

export default function MenuPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all'>('all');
  const { business, loading: businessLoading } = useBusinessId();
  const {
    items,
    loading,
    controlled,
    unavailable,
    toggleControlled,
    toggleUnavailable,
    setAllControlled,
    refresh,
  } = useMenuItems(business?.id ?? '');

  const filtered = items.filter((item) => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const controlledCount = items.filter((i) => controlled[i.id] !== false).length;
  const unavailableCount = items.filter((i) => unavailable[i.id]).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-green-500" />
          <p className="text-[11px] text-green-500 uppercase tracking-[0.2em] font-semibold">Menu Management</p>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
              Your Menu Items
            </h1>
            <p className="text-zinc-400 text-sm lg:text-base max-w-lg">Control which items the AI pipeline can optimize. Toggle AI control and availability per item.</p>
          </div>
          <button onClick={() => refresh()} disabled={loading} className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 text-sm font-medium hover:bg-zinc-800 hover:text-white disabled:opacity-50 transition-all duration-150 flex items-center gap-2 flex-shrink-0">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Reload
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: String(items.length) },
          { label: 'AI Controlled', value: String(controlledCount) },
          { label: 'Unavailable', value: String(unavailableCount) },
          { label: 'Categories', value: String(MENU_CATEGORIES.length) },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4">
            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.15em] font-semibold">{stat.label}</p>
            <p className="text-2xl font-extrabold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + bulk actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-green-500/30 focus:ring-1 focus:ring-green-500/20 transition-all duration-150"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAllControlled(true)} className="px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold hover:bg-green-500/20 transition-all duration-150 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            Control All
          </button>
          <button onClick={() => setAllControlled(false)} className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold hover:bg-zinc-800 hover:text-white transition-all duration-150 flex items-center gap-1.5">
            <BotOff className="w-3.5 h-3.5" />
            Release All
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
            activeCategory === 'all' ? 'bg-zinc-800 border border-zinc-700 text-white' : 'bg-zinc-900 border border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          All ({items.length})
        </button>
        {MENU_CATEGORIES.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          const count = items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                activeCategory === cat ? 'bg-zinc-800 border border-zinc-700 text-white' : 'bg-zinc-900 border border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Menu items grid */}
      {loading || businessLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5">
              <div className="animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-zinc-800 rounded w-2/3" />
                    <div className="h-2 bg-zinc-900 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-2 bg-zinc-900 rounded" />
                <div className="flex gap-1.5">
                  <div className="h-4 w-12 rounded-full bg-zinc-900" />
                  <div className="h-4 w-16 rounded-full bg-zinc-900" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-3xl p-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
            <UtensilsCrossed className="w-10 h-10 text-zinc-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            {search ? 'No items found' : 'No menu items'}
          </h3>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            {businessLoading
              ? 'Loading your business...'
              : search
                ? 'Try a different search term.'
                : 'Add menu items to your business to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <MenuItemCard
              key={item.id}
              item={item}
              isControlled={controlled[item.id] !== false}
              isUnavailable={unavailable[item.id] === true}
              onToggleControlled={() => toggleControlled(item.id)}
              onToggleUnavailable={() => toggleUnavailable(item.id)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
