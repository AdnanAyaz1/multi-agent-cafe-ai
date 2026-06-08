'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WeatherData } from '@/lib/types';

export interface HomeDashboardState {
  weather: WeatherData | null;
  recommendation: {
    summary: string;
    confidence: number;
    actions: string[];
  } | null;
  priorityActions: string[];
  recentRuns: Array<{
    id: string;
    businessId: string;
    status: string;
    completedAt: string;
  }>;
  loading: boolean;
  error: string | null;
}

const DEFAULT_BUSINESS_ID = 'cafe-001';

export function useHomeDashboard() {
  const [state, setState] = useState<HomeDashboardState>({
    weather: null,
    recommendation: null,
    priorityActions: [],
    recentRuns: [],
    loading: true,
    error: null,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Fetch weather for default city
      let weatherData: WeatherData | null = null;
      try {
        const weatherRes = await fetch('/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city: 'Seattle' }),
        });
        if (weatherRes.ok) {
          const weatherJson = await weatherRes.json();
          weatherData = weatherJson.data ?? null;
        }
      } catch {
        // Weather fetch failed, continue without it
      }

      // Fetch latest pipeline status for recommendation data
      const recommendation = null;
      const priorityActions: string[] = [];
      let recentRuns: HomeDashboardState['recentRuns'] = [];

      try {
        const analysisRes = await fetch(`/api/competitor/${DEFAULT_BUSINESS_ID}`);
        if (analysisRes.ok) {
          const analysisData = await analysisRes.json();
          // Use competitor data to derive insights
          if (analysisData.snapshots?.length > 0) {
            recentRuns = analysisData.snapshots.slice(0, 5).map((s: { id: string; collectedAt: string }) => ({
              id: s.id,
              businessId: DEFAULT_BUSINESS_ID,
              status: 'complete',
              completedAt: s.collectedAt,
            }));
          }
        }
      } catch {
        // Analysis fetch failed
      }

      setState({
        weather: weatherData,
        recommendation,
        priorityActions,
        recentRuns,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load dashboard',
      }));
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { ...state, refresh: fetchDashboardData };
}
