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

export interface CompetitorScrapeResult {
  url: string;
  finalUrl: string;
  title: string;
  text: string;
  scrapedAt: string;
  durationMs: number;
}

export interface CompetitorMenuItem {
  name: string;
  category?: string;
  price?: number;
  currency?: string;
  description?: string;
  isPromo: boolean;
}

export interface CompetitorPromo {
  text: string;
  discountPercent?: number;
  validUntil?: string;
}

export interface CompetitorData {
  url: string;
  finalUrl: string;
  brand?: string;
  items: CompetitorMenuItem[];
  promos: CompetitorPromo[];
  notes: string[];
  scrapedAt: string;
}
