import { Cloud, CloudRain, CloudSnow, CloudLightning, Sun } from 'lucide-react';

export function ConditionIcon({ condition, size = 48 }: { condition: string; size?: number }) {
  const lower = condition.toLowerCase();
  const cls = 'text-[#ffd79f]';
  if (lower.includes('rain') || lower.includes('drizzle')) return <CloudRain className={cls} size={size} />;
  if (lower.includes('snow')) return <CloudSnow className={cls} size={size} />;
  if (lower.includes('storm') || lower.includes('thunder')) return <CloudLightning className={cls} size={size} />;
  if (lower.includes('cloud') || lower.includes('overcast') || lower.includes('fog')) return <Cloud className={cls} size={size} />;
  return <Sun className={cls} size={size} />;
}
