'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const widgetLoading = (
  <Card className="h-full">
    <CardHeader>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-40" />
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
    </CardContent>
  </Card>
);

const WeatherDisplay = dynamic(
  () => import('@/components/dashboard/WeatherDisplay'),
  { loading: () => widgetLoading }
);

const AnalysisPanel = dynamic(
  () => import('@/components/dashboard/AnalysisPanel'),
  { loading: () => widgetLoading }
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
