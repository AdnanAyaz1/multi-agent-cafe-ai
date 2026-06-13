import { CloudRain, CloudSnow, Cloud, Sun } from 'lucide-react';

export function getConditionIcon(condition: string) {
  const lower = condition.toLowerCase();
  if (lower.includes('rain')) return CloudRain;
  if (lower.includes('snow')) return CloudSnow;
  if (lower.includes('cloud')) return Cloud;
  return Sun;
}

export function getImpactTitle(impact: string) {
  if (impact === 'high') return 'High Business Impact';
  if (impact === 'medium') return 'Moderate Business Impact';
  return 'Low Business Impact';
}

export function ConditionIcon({ condition }: { condition: string }) {
  const lower = condition.toLowerCase();
  if (lower.includes('rain')) return <CloudRain className="size-10 text-info" />;
  if (lower.includes('snow')) return <CloudSnow className="size-10 text-info" />;
  if (lower.includes('cloud')) return <Cloud className="size-10 text-info" />;
  return <Sun className="size-10 text-info" />;
}
