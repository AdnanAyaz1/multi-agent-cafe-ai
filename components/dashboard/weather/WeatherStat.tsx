import type { LucideIcon } from 'lucide-react';

export interface WeatherStatProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function WeatherStat({ icon: Icon, label, value }: WeatherStatProps) {
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
