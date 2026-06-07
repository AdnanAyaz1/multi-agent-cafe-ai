'use client';

import { Loader2, MapPin, Search, Sun } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { useWeatherForm } from '@/hooks/useWeatherForm';
import { WeatherCard } from './WeatherCard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DEFAULT_CITY_PLACEHOLDER } from '@/constants/pipeline';

export default function WeatherDisplay() {
  const { weather, loading, error, fetch: fetchWeather } = useWeather();
  const form = useWeatherForm(fetchWeather);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary">
          <Sun className="size-4" aria-hidden />
          <span className="text-xs font-medium uppercase tracking-[0.18em]">
            Weather
          </span>
        </div>
        <CardTitle className="text-lg">Live snapshot</CardTitle>
        <CardDescription>
          Fetch current conditions for any city to feed the agent pipeline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            form.submit();
          }}
        >
          <div className="relative flex-1">
            <MapPin
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="text"
              value={form.city}
              onChange={(e) => form.setCity(e.target.value)}
              placeholder={DEFAULT_CITY_PLACEHOLDER}
              className="pl-9"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !form.canSubmit}
            className="cursor-pointer gap-1.5"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Search className="size-4" aria-hidden />
            )}
            {loading ? 'Loading' : 'Get Weather'}
          </Button>
        </form>

        {error && (
          <div
            role="alert"
            className={cn(
              'rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive'
            )}
          >
            {error}
          </div>
        )}

        {weather && <WeatherCard data={weather} />}
      </CardContent>
    </Card>
  );
}
