'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/dashboard/ui/PageHeader';
import { OverviewCards } from '@/components/dashboard/home/OverviewCards';
import { AgentTimeline } from '@/components/dashboard/home/AgentTimeline';
import { CategorizationInsights } from '@/components/dashboard/home/CategorizationInsights';
import { WeatherDetailCard } from '@/components/dashboard/home/WeatherDetailCard';
import { RecentRuns } from '@/components/dashboard/home/RecentRuns';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import type { WeatherData } from '@/lib/types';
import type { StatCardData, CategorizationInsight, RecentRun } from '@/types/dashboard';
import { CloudRain, BarChart3, Megaphone, Tag } from 'lucide-react';

export default function DashboardPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city: 'Seattle' }),
        });
        if (res.ok) {
          const json = await res.json();
          setWeather(json.data ?? null);
        }
      } catch {
        // Weather fetch failed
      }
    }
    fetchWeather();
  }, []);

  const overviewCards: StatCardData[] = [
    {
      label: 'Current Weather',
      value: weather ? `${weather.condition}, ${weather.temperature}°C` : 'Loading...',
      icon: CloudRain,
      iconBg: 'glass',
      iconColor: 'text-info',
    },
    {
      label: 'Items Analyzed',
      value: '—',
      icon: BarChart3,
      iconBg: 'bg-muted',
      iconColor: 'text-card-foreground',
    },
    {
      label: 'Recommended Promos',
      value: '—',
      icon: Megaphone,
      iconBg: 'bg-accent/20',
      iconColor: 'text-secondary',
    },
    {
      label: 'Recommended Discounts',
      value: '—',
      icon: Tag,
      iconBg: 'bg-success/30',
      iconColor: 'text-success-foreground',
    },
  ];

  const categorizationInsights: CategorizationInsight[] = [
    { name: 'Hot Beverages', trend: '—', color: 'text-muted-foreground' },
    { name: 'Cold Beverages', trend: '—', color: 'text-muted-foreground' },
    { name: 'Pastries', trend: '—', color: 'text-muted-foreground' },
    { name: 'Sandwiches', trend: '—', color: 'text-muted-foreground' },
  ];

  const recentRuns: RecentRun[] = [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your cafe intelligence overview."
      />

      <OverviewCards cards={overviewCards} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          {weather ? (
            <WeatherDetailCard data={weather} />
          ) : (
            <EmptyState
              icon="🌤️"
              title="No Weather Data"
              description="Weather data will appear here once fetched."
            />
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CategorizationInsights insights={categorizationInsights} />
            <AgentTimeline />
          </div>
          <RecentRuns runs={recentRuns} />
        </div>
      </div>
    </div>
  );
}
