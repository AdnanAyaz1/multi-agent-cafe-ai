import { CloudRain, CloudSnow, Cloud, Sun, AlertTriangle } from 'lucide-react';
import { StatCardGrid, type StatCardData } from '../ui/StatCardGrid';
import { Card } from '../ui/Card';
import { CardHeading } from '../ui/CardHeading';
import { getImpactLevel, IMPACT_MESSAGES } from '@/utils/weather';
import type { WeatherStatsOverviewProps } from '@/types/dashboard';

function getConditionIcon(condition: string) {
  const lower = condition.toLowerCase();
  if (lower.includes('rain')) return CloudRain;
  if (lower.includes('snow')) return CloudSnow;
  if (lower.includes('cloud')) return Cloud;
  return Sun;
}

function getImpactTitle(impact: string) {
  if (impact === 'high') return 'High Business Impact';
  if (impact === 'medium') return 'Moderate Business Impact';
  return 'Low Business Impact';
}

export function WeatherStatsOverview({ city, country, temperature, condition }: WeatherStatsOverviewProps) {
  const ConditionIcon = getConditionIcon(condition);
  const impact = getImpactLevel(condition);

  const statCards: StatCardData[] = [
    {
      label: 'Temperature',
      value: `${temperature}°C`,
      icon: ConditionIcon,
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
    },
    {
      label: 'Location',
      value: city,
      icon: Cloud,
      iconBg: 'bg-muted',
      iconColor: 'text-card-foreground',
    },
    {
      label: 'Condition',
      value: condition,
      icon: ConditionIcon,
      iconBg: 'bg-success/30',
      iconColor: 'text-success-foreground',
    },
    {
      label: 'Impact',
      value: impact.charAt(0).toUpperCase() + impact.slice(1),
      icon: AlertTriangle,
      iconBg: 'bg-destructive/5',
      iconColor: 'text-destructive',
    },
  ];

  return (
    <div className="space-y-6">
      <StatCardGrid cards={statCards} />

      <Card overflow className="p-6">
        <CardHeading className="mb-4">Weather Summary</CardHeading>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/40 p-3 rounded-lg border border-white/50">
            <p className="text-xs text-muted-foreground font-bold uppercase">City</p>
            <p className="text-lg font-semibold text-card-foreground">{city}</p>
          </div>
          <div className="bg-white/40 p-3 rounded-lg border border-white/50">
            <p className="text-xs text-muted-foreground font-bold uppercase">Country</p>
            <p className="text-lg font-semibold text-card-foreground">{country}</p>
          </div>
          <div className="bg-white/40 p-3 rounded-lg border border-white/50">
            <p className="text-xs text-muted-foreground font-bold uppercase">Temperature</p>
            <p className="text-lg font-semibold text-card-foreground">{temperature}°C</p>
          </div>
          <div className="bg-white/40 p-3 rounded-lg border border-white/50">
            <p className="text-xs text-muted-foreground font-bold uppercase">Condition</p>
            <p className="text-lg font-semibold text-card-foreground">{condition}</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-info/10 rounded-lg">
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
