import {
  Cloud,
  CloudRain,
  CloudSnow,
  type LucideIcon,
  Sun,
} from 'lucide-react';

export function renderWeatherConditionIcon(
  condition: string,
  className: string
): React.ReactElement {
  const c = condition.toLowerCase();
  const Icon: LucideIcon = pickIcon(c);
  return <Icon className={className} aria-hidden />;
}

function pickIcon(condition: string): LucideIcon {
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
    return CloudRain;
  }
  if (condition.includes('snow')) return CloudSnow;
  if (condition.includes('cloud') || condition.includes('overcast') || condition.includes('mist')) {
    return Cloud;
  }
  return Sun;
}
