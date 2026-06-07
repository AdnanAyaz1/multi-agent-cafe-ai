import {
  Droplets,
  MapPin,
  Sun,
  Thermometer,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import type { WeatherData } from '@/lib/types';
import { formatWeatherUnit } from '@/lib/format';
import { renderWeatherConditionIcon } from './weather-condition-icon';

export function WeatherCard({ data }: { data: WeatherData }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/8 via-card to-info/8">
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
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          {renderWeatherConditionIcon(data.condition, 'size-6')}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px bg-border/60 sm:grid-cols-4">
        <Stat icon={Thermometer} label="Feels like" value={`${data.feelsLike}°${formatWeatherUnit(data.units)}`} />
        <Stat icon={Droplets} label="Humidity" value={`${data.humidity}%`} />
        <Stat icon={Wind} label="Wind" value={`${data.windSpeed} m/s`} />
        <Stat
          icon={Sun}
          label="Units"
          value={data.units === 'metric' ? 'Metric' : 'Imperial'}
        />
      </dl>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 bg-card/80 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3" aria-hidden />
        {label}
      </div>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
