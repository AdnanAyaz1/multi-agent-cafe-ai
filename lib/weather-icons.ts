import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  type LucideIcon,
} from 'lucide-react';

export function getWeatherIcon(condition: string): LucideIcon {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return CloudRain;
  if (c.includes('snow')) return CloudSnow;
  if (c.includes('storm') || c.includes('thunder')) return CloudLightning;
  if (c.includes('cloud') || c.includes('overcast') || c.includes('fog') || c.includes('mist')) return Cloud;
  return Sun;
}

export function getWeatherIconClassName(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return 'text-[#e07850]';
  if (c.includes('snow')) return 'text-white';
  if (c.includes('storm') || c.includes('thunder')) return 'text-amber-500';
  if (c.includes('cloud') || c.includes('overcast')) return 'text-zinc-400';
  return 'text-amber-500';
}
