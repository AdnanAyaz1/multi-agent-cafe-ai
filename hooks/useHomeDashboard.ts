'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WeatherData } from '@/lib/types';
import { generateWeatherSuggestion, type WeatherSuggestion } from '@/utils/weather-suggestions';

export interface BusinessProfile {
  id: string;
  name: string;
  city: string;
  cities: string[];
  type: string;
  timezone: string;
  competitorUrls: string[];
  isOnboarded: boolean;
}

export interface HomeDashboardState {
  business: BusinessProfile | null;
  activeCity: string;
  cities: string[];
  competitorUrls: string[];
  isOnboarded: boolean;
  weather: WeatherData | null;
  weatherSuggestion: WeatherSuggestion | null;
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
  isOnboardingOpen: boolean;
  loading: boolean;
  error: string | null;
}

export function useHomeDashboard() {
  const [state, setState] = useState<HomeDashboardState>({
    business: null,
    activeCity: '',
    cities: [],
    competitorUrls: [],
    isOnboarded: false,
    weather: null,
    weatherSuggestion: null,
    recommendation: null,
    priorityActions: [],
    recentRuns: [],
    isOnboardingOpen: false,
    loading: true,
    error: null,
  });

  const fetchDashboardData = useCallback(async (forcedCity?: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // 1. Fetch authenticated user business profile
      let bizProfile: BusinessProfile | null = null;
      let operationalCities: string[] = [];
      let targetCity = forcedCity;

      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.business) {
            bizProfile = {
              id: meData.business.id,
              name: meData.business.name || 'My Cafe',
              city: meData.business.city || 'Seattle',
              cities: meData.business.cities || (meData.business.city ? [meData.business.city] : ['Seattle']),
              type: meData.business.type || 'cafe',
              timezone: meData.business.timezone || 'UTC',
              competitorUrls: meData.business.competitorUrls || [],
              isOnboarded: !!meData.business.isOnboarded,
            };
            operationalCities = bizProfile.cities;
            if (!targetCity) {
              targetCity = operationalCities[0] || bizProfile.city || 'Seattle';
            }
          }
        }
      } catch {
        // Fallback if not authenticated yet or error
      }

      if (!targetCity) {
        targetCity = 'Seattle';
      }

      // 2. Fetch real-time weather for the target operational city
      let weatherData: WeatherData | null = null;
      let weatherSuggestion: WeatherSuggestion | null = null;

      try {
        const weatherRes = await fetch('/api/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city: targetCity }),
        });
        if (weatherRes.ok) {
          const weatherJson = await weatherRes.json();
          if (weatherJson.data) {
            const validWeather = weatherJson.data as WeatherData;
            weatherData = validWeather;
            weatherSuggestion = generateWeatherSuggestion(validWeather);
          }
        }
      } catch {
        // Weather fetch failed, continue gracefully
      }

      // 3. Fetch competitor snapshot activity for this real business
      let recentRuns: HomeDashboardState['recentRuns'] = [];
      if (bizProfile?.id) {
        try {
          const compRes = await fetch(`/api/competitor/${bizProfile.id}`);
          if (compRes.ok) {
            const compData = await compRes.json();
            if (compData.snapshots?.length > 0) {
              recentRuns = compData.snapshots.slice(0, 5).map((s: { id: string; collectedAt: string }) => ({
                id: s.id,
                businessId: bizProfile!.id,
                status: 'complete',
                completedAt: s.collectedAt,
              }));
            }
          }
        } catch {
          // Snapshots query failed, non-blocking
        }
      }

      setState((prev) => ({
        ...prev,
        business: bizProfile,
        activeCity: targetCity!,
        cities: operationalCities.length > 0 ? operationalCities : [targetCity!],
        competitorUrls: bizProfile?.competitorUrls || [],
        isOnboarded: !!bizProfile?.isOnboarded,
        weather: weatherData,
        weatherSuggestion,
        recentRuns,
        // Auto-open onboarding modal only if business exists and has no operational cities or competitors configured
        isOnboardingOpen: prev.isOnboardingOpen || (bizProfile !== null && !bizProfile.isOnboarded),
        loading: false,
        error: null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load dashboard',
      }));
    }
  }, []);

  const switchCity = useCallback((newCity: string) => {
    fetchDashboardData(newCity);
  }, [fetchDashboardData]);

  const setIsOnboardingOpen = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, isOnboardingOpen: open }));
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...state,
    switchCity,
    setIsOnboardingOpen,
    refresh: fetchDashboardData,
  };
}
