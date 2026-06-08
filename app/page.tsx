import { PageHeader } from '@/components/dashboard/ui/PageHeader';
import { OverviewCards } from '@/components/dashboard/home/OverviewCards';
import { RecommendationPanel } from '@/components/dashboard/home/RecommendationPanel';
import { AgentTimeline } from '@/components/dashboard/home/AgentTimeline';
import { CategorizationInsights } from '@/components/dashboard/home/CategorizationInsights';
import { WeatherDetailCard } from '@/components/dashboard/home/WeatherDetailCard';
import { PriorityActions } from '@/components/dashboard/home/PriorityActions';
import { RecentRuns } from '@/components/dashboard/home/RecentRuns';
import {
  MOCK_RECOMMENDATION,
  MOCK_PRIORITY_ACTIONS,
  MOCK_RECENT_RUNS,
} from '@/constants/home-page-data';

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your cafe intelligence overview."
      />

      <OverviewCards />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <RecommendationPanel
            summary={MOCK_RECOMMENDATION.summary}
            confidence={MOCK_RECOMMENDATION.confidence}
            actions={MOCK_RECOMMENDATION.actions}
          />
          <PriorityActions actions={MOCK_PRIORITY_ACTIONS} />
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WeatherDetailCard />
            <CategorizationInsights />
          </div>
          <AgentTimeline />
          <RecentRuns runs={MOCK_RECENT_RUNS} />
        </div>
      </div>
    </div>
  );
}
