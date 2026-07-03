import { MENU_CATEGORIES } from '@/constants/menu';
import { CATEGORY_CONFIG } from '@/constants/menu-display';
import { MENU_STATS_ICONS } from '@/constants/dashboard-home';
import type { MenuHeaderProps, MenuStatsProps, MenuSearchBarProps, MenuCategoryTabsProps } from '@/types/component-props';

export function MenuHeader({ loading, onRefresh }: MenuHeaderProps) {
  return (
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
          <p className="text-zinc-300 text-sm lg:text-base max-w-lg leading-relaxed">Control which items the AI pipeline can optimize. Toggle AI control and availability per item.</p>
        </div>
        <button onClick={onRefresh} disabled={loading} className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 text-sm font-medium hover:bg-zinc-800 hover:text-white disabled:opacity-50 transition-all duration-150 flex items-center gap-2 flex-shrink-0">
          <span className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Reload
        </button>
      </div>
    </div>
  );
}

export function MenuStats({ totalItems, controlledCount, unavailableCount }: MenuStatsProps) {
  const stats = [
    { label: 'Total Items', value: String(totalItems), icon: MENU_STATS_ICONS.total.icon, color: MENU_STATS_ICONS.total.color },
    { label: 'AI Controlled', value: String(controlledCount), icon: MENU_STATS_ICONS.controlled.icon, color: MENU_STATS_ICONS.controlled.color },
    { label: 'Unavailable', value: String(unavailableCount), icon: MENU_STATS_ICONS.unavailable.icon, color: MENU_STATS_ICONS.unavailable.color },
    { label: 'Categories', value: String(MENU_CATEGORIES.length), icon: MENU_STATS_ICONS.categories.icon, color: MENU_STATS_ICONS.categories.color },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-zinc-400 uppercase tracking-[0.15em] font-semibold">{stat.label}</p>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <p className="text-2xl font-extrabold text-white tracking-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export function MenuSearchBar({ search, onSearchChange, onControlAll, onReleaseAll }: MenuSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div className="flex-1 relative">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search items..."
          className="w-full pl-4 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-green-500/30 focus:ring-1 focus:ring-green-500/20 transition-all duration-150"
        />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onControlAll} className="px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-semibold hover:bg-green-500/20 transition-all duration-150 flex items-center gap-1.5">
          Control All
        </button>
        <button onClick={onReleaseAll} className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold hover:bg-zinc-800 hover:text-white transition-all duration-150 flex items-center gap-1.5">
          Release All
        </button>
      </div>
    </div>
  );
}

export function MenuCategoryTabs({ activeCategory, onCategoryChange, itemCounts, totalItems }: MenuCategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onCategoryChange('all')}
        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
          activeCategory === 'all' ? 'bg-zinc-800 border border-zinc-700 text-white' : 'bg-zinc-900 border border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
        }`}
      >
        All ({totalItems})
      </button>
      {MENU_CATEGORIES.map((cat) => {
        const cfg = CATEGORY_CONFIG[cat];
        const count = itemCounts[cat] ?? 0;
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
              activeCategory === cat ? 'bg-zinc-800 border border-zinc-700 text-white' : 'bg-zinc-900 border border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
            }`}
          >
            <cfg.Icon className="w-3.5 h-3.5" />
            {cfg.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
