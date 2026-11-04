'use client';

import { useHomeDashboard } from '@/hooks/useHomeDashboard';
import { WelcomeBanner } from '@/components/dashboard/home/WelcomeBanner';
import { StatWidget } from '@/components/dashboard/home/StatWidget';
import { WeatherWidget } from '@/components/dashboard/home/WeatherWidget';
import { AgentPipelineWidget } from '@/components/dashboard/home/AgentPipelineWidget';
import { RecommendationWidget } from '@/components/dashboard/home/RecommendationWidget';
import { RecentActivity } from '@/components/dashboard/home/RecentActivity';
import { CompetitorOverview } from '@/components/dashboard/home/CompetitorOverview';
import { CafeOnboardingWizard } from '@/components/dashboard/onboarding/CafeOnboardingWizard';
import { STAT_WIDGET_ICONS } from '@/constants/dashboard-home';

export default function DashboardPage() {
  const {
    business,
    activeCity,
    cities,
    weather,
    weatherSuggestion,
    competitorUrls,
    isOnboarded,
    isOnboardingOpen,
    setIsOnboardingOpen,
    switchCity,
    refresh,
    loading,
  } = useHomeDashboard();

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Setup Status */}
      <WelcomeBanner
        weather={weather}
        businessName={business?.name}
        cities={cities}
        activeCity={activeCity}
        competitorCount={competitorUrls.length}
        isOnboarded={isOnboarded}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget
          label={`Weather (${activeCity || 'Live'})`}
          value={weather ? `${weather.temperature}°C` : '—'}
          change={weather ? weather.condition : undefined}
          icon={STAT_WIDGET_ICONS.weather.icon}
          accentColor={STAT_WIDGET_ICONS.weather.accentColor}
        />
        <StatWidget
          label="Operational Cities"
          value={cities.length.toString()}
          change={cities.slice(0, 2).join(', ')}
          changeType="positive"
          icon={STAT_WIDGET_ICONS.items.icon}
          accentColor={STAT_WIDGET_ICONS.items.accentColor}
        />
        <StatWidget
          label="Tracked Competitors"
          value={competitorUrls.length.toString()}
          change={competitorUrls.length > 0 ? 'Live Benchmarking' : 'Add Competitors'}
          changeType={competitorUrls.length > 0 ? 'positive' : 'neutral'}
          icon={STAT_WIDGET_ICONS.promos.icon}
          accentColor={STAT_WIDGET_ICONS.promos.accentColor}
        />
        <StatWidget
          label="Avg. Recommendation"
          value="12%"
          change="AI margin protected"
          changeType="positive"
          icon={STAT_WIDGET_ICONS.discount.icon}
          accentColor={STAT_WIDGET_ICONS.discount.accentColor}
        />
      </div>

      {/* Main Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          {weather ? (
            <WeatherWidget
              data={weather}
              cities={cities}
              activeCity={activeCity}
              onCityChange={switchCity}
              suggestion={weatherSuggestion}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          ) : (
            <div className="dash-glass rounded-2xl p-8 text-center space-y-3">
              <p className="text-zinc-400 text-sm font-mono">
                {loading ? 'Analyzing live branch weather...' : 'No weather data available'}
              </p>
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#e07850] text-[#1a1208] text-xs font-bold hover:bg-[#e07850]/90 transition-all"
              >
                Configure Operational Locations
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AgentPipelineWidget />
            <RecommendationWidget />
          </div>
        </div>
      </div>

      {/* Secondary Intelligence Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <CompetitorOverview
          competitorUrls={competitorUrls}
          businessId={business?.id}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onRefreshCompetitors={refresh}
        />
      </div>

      {/* Cafe Onboarding & Setup Wizard Modal */}
      <CafeOnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialCities={cities}
        initialCompetitors={competitorUrls}
        businessId={business?.id}
        onComplete={refresh}
      />
    </div>
  );
}
