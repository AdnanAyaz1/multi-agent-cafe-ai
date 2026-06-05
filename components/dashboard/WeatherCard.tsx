import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeatherData } from '@/lib/types';

const unitSuffix = (u: WeatherData['units']): string =>
  u === 'metric' ? 'C' : 'F';

export function WeatherCard({ data }: { data: WeatherData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {data.city}, {data.country}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3">
          <Stat
            label="Temperature"
            value={`${data.temperature}°${unitSuffix(data.units)}`}
          />
          <Stat
            label="Feels Like"
            value={`${data.feelsLike}°${unitSuffix(data.units)}`}
          />
          <Stat label="Condition" value={data.condition} />
          <Stat label="Humidity" value={`${data.humidity}%`} />
          <Stat label="Wind Speed" value={`${data.windSpeed} m/s`} />
        </dl>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-muted p-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
