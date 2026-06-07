'use client';

import dynamic from 'next/dynamic';
import { WidgetSkeleton } from './WidgetSkeleton';

const WeatherDisplay = dynamic(
  () => import('@/components/dashboard/WeatherDisplay'),
  { loading: () => <WidgetSkeleton /> }
);

const AnalysisPanel = dynamic(
  () => import('@/components/dashboard/AnalysisPanel'),
  { loading: () => <WidgetSkeleton /> }
);

export function DashboardWidgets() {
  return (
    <section className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <WeatherDisplay />
      </div>
      <div className="lg:col-span-3">
        <AnalysisPanel />
      </div>
    </section>
  );
}
