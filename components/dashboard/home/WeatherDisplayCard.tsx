import { AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { CardHeading } from '../ui/CardHeading';
import { getImpactLevel, IMPACT_MESSAGES } from '@/utils/weather';
import { getImpactTitle, ConditionIcon } from '@/utils/weather-display';
import type { WeatherDisplayCardProps } from '@/types/dashboard';

export function WeatherDisplayCard({ data }: WeatherDisplayCardProps) {
  const impact = getImpactLevel(data.condition);

  return (
    <div className="space-y-6">
      <Card overflow className="p-0">
        <div className="p-6 weather-glass">
          <div className="flex justify-between items-start mb-6">
            <div>
              <CardHeading>{data.city}</CardHeading>
              <p className="text-sm text-muted-foreground">{data.country}</p>
            </div>
            <ConditionIcon condition={data.condition} />
          </div>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-5xl font-bold text-card-foreground">{data.temperature}°</span>
            <span className="text-muted-foreground">{data.condition}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Feels Like', value: `${data.feelsLike}°` },
              { label: 'Humidity', value: `${data.humidity}%` },
              { label: 'Wind', value: `${data.windSpeed} m/s` },
              { label: 'Units', value: data.units === 'metric' ? 'Metric' : 'Imperial' },
            ].map((item) => (
              <div key={item.label} className="bg-white/[0.04] p-3 rounded-lg border border-white/[0.08]">
                <p className="text-xs text-muted-foreground font-bold uppercase">{item.label}</p>
                <p className="text-lg font-semibold text-card-foreground">{item.value}</p>
              </div>
            ))}
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
    </div>
  );
}
