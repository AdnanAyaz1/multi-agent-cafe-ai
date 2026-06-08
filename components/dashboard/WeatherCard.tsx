import {
  Droplets,
  MapPin,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';
import type { WeatherData } from '@/lib/types';
import { formatWeatherUnit } from '@/lib/format';
import { renderWeatherConditionIcon } from './weather-condition-icon';
import { WeatherStat } from './weather/WeatherStat';

export function WeatherCard({ data }: { data: WeatherData }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <MapPin className="size-3" aria-hidden />
            {data.city}, {data.country}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-4xl font-semibold tracking-tight">
              {data.temperature}°
            </span>
            <span className="text-sm text-muted-foreground">
              {formatWeatherUnit(data.units)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-foreground/80">
            {renderWeatherConditionIcon(data.condition, 'size-4 text-primary')}
            {data.condition}
          </div>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {renderWeatherConditionIcon(data.condition, 'size-6')}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
        <WeatherStat icon={Thermometer} label="Feels like" value={`${data.feelsLike}°${formatWeatherUnit(data.units)}`} />
        <WeatherStat icon={Droplets} label="Humidity" value={`${data.humidity}%`} />
        <WeatherStat icon={Wind} label="Wind" value={`${data.windSpeed} m/s`} />
        <WeatherStat
          icon={Sun}
          label="Units"
          value={data.units === 'metric' ? 'Metric' : 'Imperial'}
        />
      </dl>
    </div>
  );
}
