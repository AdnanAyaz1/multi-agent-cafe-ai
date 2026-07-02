import { Cloud, CloudRain, CloudSnow, CloudLightning, Sun } from 'lucide-react';

export function ConditionIcon({ condition, size = 48 }: { condition: string; size?: number }) {
  const lower = condition.toLowerCase();
  if (lower.includes('rain') || lower.includes('drizzle')) return <CloudRain className="text-amber-500" size={size} />;
  if (lower.includes('snow')) return <CloudSnow className="text-amber-500" size={size} />;
  if (lower.includes('storm') || lower.includes('thunder')) return <CloudLightning className="text-amber-500" size={size} />;
  if (lower.includes('cloud') || lower.includes('overcast') || lower.includes('fog')) return <Cloud className="text-amber-500" size={size} />;
  return <Sun className="text-amber-500" size={size} />;
}
