'use client';

import { Sidebar } from './Sidebar';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Bell } from 'lucide-react';
import { UserNav } from './UserNav';
import Link from 'next/link';
import { useHomeDashboard } from '@/hooks/useHomeDashboard';

function TopNavWeatherIcon({ condition }: { condition?: string }) {
  if (!condition) return <Sun className="w-3.5 h-3.5 text-[#ffd79f]" />;
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-3.5 h-3.5 text-[#00d2ff]" />;
  if (c.includes('snow')) return <CloudSnow className="w-3.5 h-3.5 text-white" />;
  if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className="w-3.5 h-3.5 text-[#ffd79f]" />;
  if (c.includes('cloud') || c.includes('overcast')) return <Cloud className="w-3.5 h-3.5 text-[#859399]" />;
  return <Sun className="w-3.5 h-3.5 text-[#ffd79f]" />;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { weather } = useHomeDashboard();

  return (
    <div className="min-h-screen bg-[#0e1417]" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(0,210,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(31,225,158,0.03) 0%, transparent 50%), #0e1417' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main area: offset by sidebar width */}
      <div className="md:ml-[280px]">
        {/* Top Navigation Bar — only spans content area */}
        <nav className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 lg:px-10 border-b border-white/[0.06]" style={{ background: 'rgba(14, 20, 23, 0.9)', backdropFilter: 'blur(24px)' }}>
          {/* Left: spacer or brand for mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d2ff] to-[#1fe19e] flex items-center justify-center">
                <span className="text-[#003543] text-xs font-extrabold" style={{ fontFamily: 'var(--font-montserrat)' }}>C</span>
              </div>
              <span className="text-white text-sm font-bold" style={{ fontFamily: 'var(--font-montserrat)' }}>CafePromo<span className="gradient-text"> AI</span></span>
            </Link>
          </div>

          {/* Center: Quick info (desktop only) */}
          <div className="hidden lg:flex items-center gap-5">
            {weather && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <TopNavWeatherIcon condition={weather.condition} />
                <span className="text-white text-xs font-semibold" style={{ fontFamily: 'var(--font-montserrat)' }}>{weather.temperature}°C</span>
                <span className="text-[#859399] text-[10px]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>{weather.city}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1fe19e]/5 border border-[#1fe19e]/15">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1fe19e] animate-pulse" />
              <span className="text-[10px] text-[#1fe19e] font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>5 agents online</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[#859399] hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#ef4444] border-2 border-[#0e1417]" />
            </button>
            <UserNav />
          </div>
        </nav>

        {/* Page content */}
        <main className="px-4 md:px-10 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
