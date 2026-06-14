'use client';

import { useMemo } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { useMenuPage } from '@/hooks/useMenuPage';
import { MenuItemCard } from '@/components/dashboard/menu/MenuItemCard';
import { MenuHeader, MenuStats, MenuSearchBar, MenuCategoryTabs } from '@/components/dashboard/menu/MenuPageComponents';

export default function MenuPage() {
  const {
    search,
    setSearch,
    activeCategory,
    setActiveCategory,
    businessLoading,
    items,
    loading,
    controlled,
    unavailable,
    filtered,
    controlledCount,
    unavailableCount,
    toggleControlled,
    toggleUnavailable,
    setAllControlled,
    refresh,
  } = useMenuPage();

  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  return (
    <div className="space-y-8">
      <MenuHeader loading={loading} onRefresh={() => refresh()} />

      <MenuStats
        totalItems={items.length}
        controlledCount={controlledCount}
        unavailableCount={unavailableCount}
      />

      <MenuSearchBar
        search={search}
        onSearchChange={setSearch}
        onControlAll={() => setAllControlled(true)}
        onReleaseAll={() => setAllControlled(false)}
      />

      <MenuCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        itemCounts={itemCounts}
        totalItems={items.length}
      />

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
