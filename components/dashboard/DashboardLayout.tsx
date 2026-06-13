'use client';

import { Sidebar } from './Sidebar';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Bell } from 'lucide-react';
import { UserNav } from './UserNav';
import Link from 'next/link';
import { useHomeDashboard } from '@/hooks/useHomeDashboard';

function TopNavWeatherIcon({ condition }: { condition?: string }) {
  if (!condition) return <Sun className="w-3.5 h-3.5 text-amber-500" />;
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-3.5 h-3.5 text-[#e07850]" />;
  if (c.includes('snow')) return <CloudSnow className="w-3.5 h-3.5 text-white" />;
  if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className="w-3.5 h-3.5 text-amber-500" />;
  if (c.includes('cloud') || c.includes('overcast')) return <Cloud className="w-3.5 h-3.5 text-zinc-400" />;
  return <Sun className="w-3.5 h-3.5 text-amber-500" />;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { weather } = useHomeDashboard();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #0e0c0a 0%, #0c0a08 50%, #0e0c0a 100%)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main area: offset by sidebar width */}
      <div className="md:ml-[280px]">
        {/* Top Navigation Bar */}
        <nav className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 lg:px-10 border-b border-white/[0.06]"
          style={{ background: 'rgba(14, 12, 10, 0.85)', backdropFilter: 'blur(20px) saturate(1.1)' }}>
          {/* Left: spacer or brand for mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#e07850] flex items-center justify-center">
                <span className="text-white text-xs font-extrabold">C</span>
              </div>
              <span className="text-white text-sm font-bold">CafePromo AI</span>
            </Link>
          </div>

          {/* Center: Quick info (desktop only) */}
          <div className="hidden lg:flex items-center gap-4">
            {weather && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <TopNavWeatherIcon condition={weather.condition} />
                <span className="text-white text-xs font-semibold">{weather.temperature}°C</span>
                <span className="text-zinc-400 text-[10px]">{weather.city}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/[0.06] border border-green-500/[0.12]">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] text-green-500 font-semibold uppercase tracking-wider">5 agents online</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button className="icon-glow relative p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white transition-all duration-300">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-[#0e0c0a]" />
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
