import { ShieldCheck, History, Clock } from 'lucide-react';

interface DecisionsStatsProps {
  pendingCount: number;
  decidedCount: number;
  total: number;
}

export function DecisionsStats({ pendingCount, decidedCount, total }: DecisionsStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'Pending', value: String(pendingCount), Icon: Clock, iconColor: 'text-amber-500' },
        { label: 'Decided', value: String(decidedCount), Icon: ShieldCheck, iconColor: 'text-green-500' },
        { label: 'Total', value: String(total), Icon: History, iconColor: 'text-[#e07850]' },
      ].map((stat) => (
        <div key={stat.label} className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <stat.Icon className={`w-3.5 h-3.5 ${stat.iconColor}`} />
            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.15em] font-semibold">{stat.label}</p>
          </div>
          <p className="text-2xl font-extrabold text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
