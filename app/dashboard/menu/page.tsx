'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Search, RefreshCw, Bot, BotOff, Filter } from 'lucide-react';
import { useMenuItems } from '@/hooks/useMenuItems';
import { DEFAULT_BUSINESS_ID } from '@/constants/pipeline';
import { MENU_CATEGORIES, type MenuCategory } from '@/constants/menu';
import { CATEGORY_CONFIG } from '@/constants/menu-display';
import { MenuItemCard } from '@/components/dashboard/menu/MenuItemCard';

export default function MenuPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<MenuCategory | 'all'>('all');
  const {
    items,
    loading,
    controlled,
    unavailable,
    toggleControlled,
    toggleUnavailable,
    setAllControlled,
    refresh,
  } = useMenuItems(DEFAULT_BUSINESS_ID);

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div className="h-px w-12 bg-gradient-to-r from-[#1fe19e] to-transparent" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ transformOrigin: 'left' }} />
          <p className="text-[11px] text-[#1fe19e] uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Menu Management</p>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Your <span className="gradient-text">Menu</span> Items
            </h1>
            <p className="text-[#859399] text-sm lg:text-base max-w-lg">Control which items the AI pipeline can optimize. Toggle AI control and availability per item.</p>
          </div>
          <motion.button onClick={() => refresh()} disabled={loading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#859399] text-sm font-medium hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-white disabled:opacity-50 transition-all duration-300 flex items-center gap-2 flex-shrink-0">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Reload
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Items', value: String(items.length), color: '#00d2ff' },
          { label: 'AI Controlled', value: String(controlledCount), color: '#1fe19e' },
          { label: 'Unavailable', value: String(unavailableCount), color: '#f87171' },
          { label: 'Categories', value: String(MENU_CATEGORIES.length), color: '#ffd79f' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }} className="glass-card rounded-2xl p-4 group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-[25px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `${stat.color}12` }} />
            <p className="text-[10px] text-[#859399] uppercase tracking-[0.15em] font-semibold" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{stat.label}</p>
            <p className="text-2xl font-extrabold text-white mt-1" style={{ fontFamily: 'var(--font-montserrat)' }}>{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Search + bulk actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#859399]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm placeholder:text-[#859399]/50 focus:outline-none focus:border-[#1fe19e]/30 focus:ring-1 focus:ring-[#1fe19e]/20 transition-all duration-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAllControlled(true)} className="px-4 py-2.5 rounded-xl bg-[#1fe19e]/10 border border-[#1fe19e]/15 text-[#1fe19e] text-xs font-semibold hover:bg-[#1fe19e]/20 transition-all flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            Control All
          </button>
          <button onClick={() => setAllControlled(false)} className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#859399] text-xs font-semibold hover:bg-white/[0.06] hover:text-white transition-all flex items-center gap-1.5">
            <BotOff className="w-3.5 h-3.5" />
            Release All
          </button>
        </div>
      </motion.div>

      {/* Category tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center gap-2 overflow-x-auto pb-1"
      >
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
            activeCategory === 'all' ? 'bg-white/[0.08] border border-white/[0.12] text-white' : 'bg-white/[0.02] border border-transparent text-[#859399] hover:bg-white/[0.05] hover:text-white'
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 ${
                activeCategory === cat ? 'bg-white/[0.08] border border-white/[0.12] text-white' : 'bg-white/[0.02] border border-transparent text-[#859399] hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              {cfg.label} ({count})
            </button>
          );
        })}
      </motion.div>

      {/* Menu items grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl p-5">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/[0.06] rounded w-2/3" />
                      <div className="h-2 bg-white/[0.04] rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-2 bg-white/[0.03] rounded" />
                  <div className="flex gap-1.5">
                    <div className="h-4 w-12 rounded-full bg-white/[0.04]" />
                    <div className="h-4 w-16 rounded-full bg-white/[0.04]" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-16 text-center">
            <motion.div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <UtensilsCrossed className="w-10 h-10 text-[#859399]" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-montserrat)' }}>
              {search ? 'No items found' : 'No menu items'}
            </h3>
            <p className="text-[#859399] text-sm max-w-sm mx-auto">
              {search ? 'Try a different search term.' : 'Add menu items to your business to get started.'}
            </p>
          </motion.div>
        ) : (
          <motion.div key={activeCategory + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
