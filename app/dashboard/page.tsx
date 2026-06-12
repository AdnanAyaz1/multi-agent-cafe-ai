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
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { weather, loading } = useHomeDashboard();

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <WelcomeBanner weather={weather} />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget
          label="Current Weather"
          value={weather ? `${weather.temperature}°C` : '—'}
          change={weather ? weather.condition : undefined}
          icon={CloudRain}
          iconGradient="#00d2ff"
          index={0}
        />
        <StatWidget
          label="Items Analyzed"
          value="24"
          change="+6 this week"
          changeType="positive"
          icon={BarChart3}
          iconGradient="#1fe19e"
          index={1}
        />
        <StatWidget
          label="Active Promos"
          value="3"
          change="1 expiring soon"
          changeType="neutral"
          icon={Megaphone}
          iconGradient="#ffd79f"
          index={2}
        />
        <StatWidget
          label="Avg. Discount"
          value="12%"
          change="-2% from last week"
          changeType="negative"
          icon={Tag}
          iconGradient="#a78bfa"
          index={3}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column — Weather */}
        <div className="lg:col-span-4">
          {weather ? (
            <WeatherWidget data={weather} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-3xl p-8 text-center"
            >
              <p className="text-[#859399] text-sm" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
                {loading ? 'Loading weather data...' : 'No weather data available'}
              </p>
            </motion.div>
          )}
        </div>

        {/* Right column — Pipeline + Recommendations */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AgentPipelineWidget />
            <RecommendationWidget />
          </div>
        </div>
      </div>

      {/* Bottom row — Activity + Competitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <CompetitorOverview />
      </div>
    </div>
  );
}
