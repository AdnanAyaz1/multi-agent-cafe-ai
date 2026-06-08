import { StatCardGrid } from '../ui/StatCardGrid';
import type { OverviewCardsProps } from '@/types/dashboard';

export function OverviewCards({ cards }: OverviewCardsProps) {
  return <StatCardGrid cards={cards} />;
}
