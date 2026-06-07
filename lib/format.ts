import type { WeatherData } from '@/lib/types';

export function formatWeatherUnit(u: WeatherData['units']): string {
  return u === 'metric' ? 'C' : 'F';
}

export function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}
