import { WeatherData } from '@/lib/types';
import { WMO_CODES } from './wmo-codes';
import type { GeoResult, OpenMeteoCurrent } from './types';

const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';

function describeCondition(code: number): string {
  return WMO_CODES[code] ?? 'Unknown';
}

async function geocode(city: string): Promise<GeoResult | null> {
  const res = await fetch(
    `${GEO_BASE}?name=${encodeURIComponent(city)}&count=1&language=en`
  );
  if (!res.ok) return null;

  const body = await res.json();
  const results: GeoResult[] | undefined = body.results;
  return results?.[0] ?? null;
}

export async function fetchWeather(city: string): Promise<WeatherData> {
  const geo = await geocode(city);
  if (!geo) throw new Error(`City "${city}" not found`);

  const res = await fetch(
    `${FORECAST_BASE}?latitude=${geo.latitude}&longitude=${geo.longitude}` +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m'
  );
  if (!res.ok) throw new Error(`Weather API returned ${res.status}`);

  const body = await res.json();
  if (body.error) throw new Error(body.reason ?? 'Weather API error');

  const c: OpenMeteoCurrent | undefined = body.current;
  if (!c) throw new Error('No current weather data available');

  return {
    city: geo.name,
    country: geo.country,
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    condition: describeCondition(c.weather_code),
    windSpeed: c.wind_speed_10m,
    units: 'metric',
  };
}
