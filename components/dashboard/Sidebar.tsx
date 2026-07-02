'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, LogOut } from 'lucide-react';
import { MAIN_NAV, BOTTOM_NAV } from '@/constants/navigation';
import { signOut } from '@/lib/auth-utils';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[280px] z-40 flex flex-col pt-6 pb-6 border-r border-white/[0.06]"
      style={{ background: 'linear-gradient(180deg, rgba(14, 12, 10, 0.95), rgba(10, 8, 6, 0.98))', backdropFilter: 'blur(24px)' }}
    >
      {/* Branch Selector */}
      <div className="px-5 mb-8">
        <div className="glass-card rounded-2xl p-4 group cursor-pointer hover:border-zinc-700 transition-colors duration-150">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e07850] flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">Main Branch</p>
              <p className="text-[10px] text-green-500 uppercase tracking-wider">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {MAIN_NAV.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                isActive
                  ? 'bg-white/[0.06] text-white'
                  : 'text-zinc-400 hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#e07850]" />
              )}
              <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[#e07850]' : 'text-zinc-400 group-hover:text-white'}`} />
              <span className={`text-xs font-semibold tracking-wide ${isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 mt-auto border-t border-zinc-800 pt-4 space-y-1">
        {BOTTOM_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-white/[0.06] text-white'
                  : 'text-zinc-400 hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#e07850]' : ''}`} />
              <span className="text-xs font-semibold tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-150 w-full text-left text-zinc-400 hover:bg-red-500/10 hover:text-red-400 group"
        >
          <LogOut className="w-[18px] h-[18px] group-hover:text-red-400" />
          <span className="text-xs font-semibold tracking-wide">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
