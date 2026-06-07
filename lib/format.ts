import type { WeatherData } from '@/lib/types';

export function formatWeatherUnit(u: WeatherData['units']): string {
  return u === 'metric' ? 'C' : 'F';
}
