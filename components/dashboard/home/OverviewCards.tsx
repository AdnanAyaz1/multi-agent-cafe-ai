import { OVERVIEW_CARDS } from '@/constants/overview-cards';
import { StatCardGrid } from '../ui/StatCardGrid';

export function OverviewCards() {
  return <StatCardGrid cards={OVERVIEW_CARDS} />;
}
