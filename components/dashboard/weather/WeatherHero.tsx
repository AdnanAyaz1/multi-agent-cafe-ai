import { ConditionIcon } from './ConditionIcon';
import type { WeatherData } from '@/lib/types';

interface WeatherHeroProps {
  weather: WeatherData;
}

export function WeatherHero({ weather }: WeatherHeroProps) {
  return (
    <div className="glass-card rounded-3xl overflow-hidden">
      <div className="relative z-10">
        <div className="h-1 w-full bg-[#e07850]" />
        <div className="p-8 lg:p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#e07850]/10 border border-[#e07850]/20 flex items-center justify-center">
                <ConditionIcon condition={weather.condition} size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{weather.city}</h2>
                <p className="text-zinc-400 text-sm">{weather.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[11px] text-green-500 font-semibold font-mono">LIVE</span>
            </div>
          </div>

          <div className="flex items-start gap-6 mb-10">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-8xl lg:text-9xl font-extrabold text-white leading-none">
                  {weather.temperature}
                </span>
                <span className="text-3xl text-zinc-400 font-light">°C</span>
              </div>
              <p className="text-zinc-400 text-lg mt-2">
                {weather.condition}
              </p>
            </div>
            <ConditionIcon condition={weather.condition} size={64} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Feels Like', value: `${weather.feelsLike}°C` },
              { label: 'Humidity', value: `${weather.humidity}%` },
              { label: 'Wind', value: `${weather.windSpeed} m/s` },
              { label: 'Units', value: weather.units === 'metric' ? 'Metric' : 'Imperial' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center hover:bg-zinc-800 transition-all duration-150">
                <p className="text-white text-lg font-bold font-mono">{stat.value}</p>
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider mt-1 font-mono">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
