import { WeatherData } from '@/lib/types';

const unit = (u: WeatherData['units']) => (u === 'metric' ? 'C' : 'F');

export function WeatherCard({ data }: { data: WeatherData }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">
        {data.city}, {data.country}
      </h2>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Temperature" value={`${data.temperature}°${unit(data.units)}`} />
        <Stat label="Feels Like" value={`${data.feelsLike}°${unit(data.units)}`} />
        <Stat label="Condition" value={data.condition} />
        <Stat label="Humidity" value={`${data.humidity}%`} />
        <Stat label="Wind Speed" value={`${data.windSpeed} m/s`} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-gray-50 p-2">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
