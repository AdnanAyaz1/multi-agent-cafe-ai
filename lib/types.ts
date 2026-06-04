export interface WeatherData {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  units: 'metric' | 'imperial';
}

export interface WeatherResult {
  data?: WeatherData;
  error?: string;
}
