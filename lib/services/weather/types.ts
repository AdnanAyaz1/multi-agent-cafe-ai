export interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

export interface OpenMeteoCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface EnsureWeatherOptions {
  businessId: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
}
