import { Clock, History } from 'lucide-react';
import type { DecisionsTabSwitcherProps } from '@/types/component-props';

export function DecisionsTabSwitcher({ activeTab, onTabChange, pendingCount }: DecisionsTabSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onTabChange('pending')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
          activeTab === 'pending'
            ? 'bg-zinc-800 border border-zinc-700 text-white'
            : 'bg-zinc-900 border border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        Pending ({pendingCount})
      </button>
      <button
        onClick={() => onTabChange('history')}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
          activeTab === 'history'
            ? 'bg-zinc-800 border border-zinc-700 text-white'
            : 'bg-zinc-900 border border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
        }`}
      >
        <History className="w-3.5 h-3.5" />
        History
      </button>
    </div>
  );
}
