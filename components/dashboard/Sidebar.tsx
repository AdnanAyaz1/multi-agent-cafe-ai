'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Store } from 'lucide-react';
import { MAIN_NAV, BOTTOM_NAV } from '@/constants/navigation';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] z-40 flex flex-col pt-20 pb-8 bg-sidebar border-r border-border">
      {/* Cafe Branch Selector */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <Store className="size-5 text-sidebar-accent-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sidebar-foreground">Main Branch</p>
            <p className="text-xs text-muted-foreground">Active: Morning Rush</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {MAIN_NAV.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-3 mx-2 rounded-xl transition-all',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground translate-x-1'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <item.icon className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-2 mt-auto border-t border-border pt-4 space-y-1">
        {BOTTOM_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-3 mx-2 rounded-xl transition-all',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <item.icon className="size-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
