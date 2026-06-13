'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutPlan = searchParams.get('checkout');

  useEffect(() => {
    if (!checkoutPlan) return;

    const runCheckout = async () => {
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: checkoutPlan }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } catch {
        // silently fail
      }
    };

    runCheckout();
  }, [checkoutPlan, router]);

  if (checkoutPlan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#e07850]/10 border border-[#e07850]/20 flex items-center justify-center mx-auto mb-4">
            <div className="w-5 h-5 border-2 border-[#e07850] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-white text-sm font-semibold">Redirecting to checkout...</p>
          <p className="text-zinc-500 text-xs mt-1">Setting up your subscription</p>
        </div>
      </div>
    );
  }

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
            <div className="dash-glass rounded-2xl p-8 text-center">
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
