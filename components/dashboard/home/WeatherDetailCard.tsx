import { Cloud, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { CardHeading } from '../ui/CardHeading';
import { getImpactLevel, IMPACT_MESSAGES } from '@/utils/weather';
import type { WeatherDetailCardProps } from '@/types/dashboard';

function getImpactTitle(impact: string) {
  if (impact === 'high') return 'High Business Impact';
  if (impact === 'medium') return 'Moderate Business Impact';
  return 'Low Business Impact';
}

export function WeatherDetailCard({ data }: WeatherDetailCardProps) {
  const impact = getImpactLevel(data.condition);

  return (
    <Card overflow className="p-0">
      <div className="p-6 weather-glass">
        <div className="flex justify-between items-start mb-6">
          <div>
            <CardHeading>Local Climate</CardHeading>
            <p className="text-sm text-muted-foreground">{data.city}</p>
          </div>
          <Cloud className="size-10 text-info" />
        </div>

        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-5xl font-bold text-card-foreground">{data.temperature}°C</span>
          <span className="text-muted-foreground">{data.condition}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/40 p-3 rounded-lg border border-white/50">
            <p className="text-xs text-muted-foreground font-bold uppercase">Humidity</p>
            <p className="text-lg font-semibold text-card-foreground">{data.humidity}%</p>
          </div>
          <div className="bg-white/40 p-3 rounded-lg border border-white/50">
            <p className="text-xs text-muted-foreground font-bold uppercase">Wind</p>
            <p className="text-lg font-semibold text-card-foreground">{data.windSpeed} m/s</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-info/10">
        <p className="text-sm font-bold text-card-foreground flex items-center gap-2">
          <AlertTriangle className="size-[18px]" />
          {getImpactTitle(impact)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">{IMPACT_MESSAGES[impact]}</p>
      </div>
    </Card>
  );
}
