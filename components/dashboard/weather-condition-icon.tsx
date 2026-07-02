import { getWeatherIcon } from '@/lib/weather-icons';

export function renderWeatherConditionIcon(
  condition: string,
  className: string
): React.ReactElement {
  const Icon = getWeatherIcon(condition);
  return <Icon className={className} aria-hidden />;
}
