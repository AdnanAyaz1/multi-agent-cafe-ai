'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Store, LogOut } from 'lucide-react';
import { MAIN_NAV, BOTTOM_NAV } from '@/constants/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    const csrfRes = await fetch('/api/auth/csrf');
    const { csrfToken } = await csrfRes.json();
    await fetch('/api/auth/signout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ csrfToken }),
    });
    window.location.href = '/auth/login';
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 h-full w-[280px] z-40 flex flex-col pt-6 pb-6 border-r border-white/[0.06]"
      style={{ background: 'rgba(14, 20, 23, 0.95)', backdropFilter: 'blur(24px)' }}
    >
      {/* Branch Selector */}
      <div className="px-5 mb-8">
        <div className="glass-card rounded-2xl p-4 group cursor-pointer hover:border-white/[0.12] transition-all duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#1fe19e] flex items-center justify-center shadow-lg shadow-[#00d2ff]/10 group-hover:shadow-[#00d2ff]/20 transition-shadow duration-500">
              <Store className="w-5 h-5 text-[#003543]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate" style={{ fontFamily: 'var(--font-montserrat)' }}>Main Branch</p>
              <p className="text-[10px] text-[#1fe19e] uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {MAIN_NAV.map((item, i) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                  isActive
                    ? 'bg-white/[0.06] text-white'
                    : 'text-[#859399] hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-[#00d2ff] to-[#1fe19e]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[#00d2ff]' : 'text-[#859399] group-hover:text-white'}`} />
                <span className={`text-xs font-semibold tracking-wide ${isActive ? 'text-white' : ''}`} style={{ fontFamily: 'var(--font-montserrat)' }}>
                  {item.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 mt-auto border-t border-white/[0.06] pt-4 space-y-1">
        {BOTTOM_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-white/[0.06] text-white'
                  : 'text-[#859399] hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#00d2ff]' : ''}`} />
              <span className="text-xs font-semibold tracking-wide" style={{ fontFamily: 'var(--font-montserrat)' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-left text-[#859399] hover:bg-red-500/10 hover:text-red-400 group"
        >
          <LogOut className="w-[18px] h-[18px] group-hover:text-red-400" />
          <span className="text-xs font-semibold tracking-wide" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Logout
          </span>
        </button>
      </div>
    </motion.aside>
  );
}
