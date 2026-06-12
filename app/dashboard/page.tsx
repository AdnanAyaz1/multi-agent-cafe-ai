'use client';

import { useHomeDashboard } from '@/hooks/useHomeDashboard';
import { WelcomeBanner } from '@/components/dashboard/home/WelcomeBanner';
import { StatWidget } from '@/components/dashboard/home/StatWidget';
import { WeatherWidget } from '@/components/dashboard/home/WeatherWidget';
import { AgentPipelineWidget } from '@/components/dashboard/home/AgentPipelineWidget';
import { RecommendationWidget } from '@/components/dashboard/home/RecommendationWidget';
import { RecentActivity } from '@/components/dashboard/home/RecentActivity';
import { CompetitorOverview } from '@/components/dashboard/home/CompetitorOverview';
import { CloudRain, BarChart3, Megaphone, Tag } from 'lucide-react';

export default function DashboardPage() {
  const { weather, loading } = useHomeDashboard();

  return (
    <div className="space-y-6">
      <WelcomeBanner weather={weather} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget
          label="Current Weather"
          value={weather ? `${weather.temperature}°C` : '—'}
          change={weather ? weather.condition : undefined}
          icon={CloudRain}
          accentColor="blue"
        />
        <StatWidget
          label="Items Analyzed"
          value="24"
          change="+6 this week"
          changeType="positive"
          icon={BarChart3}
          accentColor="green"
        />
        <StatWidget
          label="Active Promos"
          value="3"
          change="1 expiring soon"
          changeType="neutral"
          icon={Megaphone}
          accentColor="amber"
        />
        <StatWidget
          label="Avg. Discount"
          value="12%"
          change="-2% from last week"
          changeType="negative"
          icon={Tag}
          accentColor="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          {weather ? (
            <WeatherWidget data={weather} />
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <p className="text-zinc-400 text-sm font-mono">
                {loading ? 'Loading weather data...' : 'No weather data available'}
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AgentPipelineWidget />
            <RecommendationWidget />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <CompetitorOverview />
      </div>
    </div>
  );
}
