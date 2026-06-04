import { WeatherData } from '@/lib/types';

const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';

const WMO_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

interface OpenMeteoCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
}

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
