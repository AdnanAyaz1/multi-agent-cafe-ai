'use client';

import { Link } from 'lucide-react';
import { QUICK_ACTIONS } from '@/constants/quick-actions';

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {QUICK_ACTIONS.map((action) => (
        <Link key={action.title} href={action.href} className="glass-card rounded-xl p-5 block group transition-colors duration-150 hover:bg-zinc-800/50">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-3">
            <action.icon className="w-5 h-5 text-zinc-300" />
          </div>
          <p className="text-white text-sm font-semibold mb-1">{action.title}</p>
          <p className="text-zinc-400 text-xs flex items-center gap-1.5">
            {action.description}
            <Link className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150" />
          </p>
        </Link>
      ))}
    </div>
  );
}
