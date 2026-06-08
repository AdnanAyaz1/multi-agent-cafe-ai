import type { StatCardData } from '@/types/dashboard';
import { CloudRain, BarChart3, Megaphone, Tag } from 'lucide-react';

export const OVERVIEW_CARDS: StatCardData[] = [
  {
    label: 'Current Weather',
    value: 'Rainy, 18°C',
    icon: CloudRain,
    iconBg: 'glass',
    iconColor: 'text-[#709797]',
  },
  {
    label: 'Items Analyzed',
    value: '42',
    icon: BarChart3,
    iconBg: 'bg-[#f3ecea]',
    iconColor: 'text-[#25160e]',
  },
  {
    label: 'Recommended Promos',
    value: '2',
    icon: Megaphone,
    iconBg: 'bg-[rgba(255,202,152,0.2)]',
    iconColor: 'text-[#7d562d]',
  },
  {
    label: 'Recommended Discounts',
    value: '3',
    icon: Tag,
    iconBg: 'bg-[rgba(204,213,174,0.3)]',
    iconColor: 'text-[#424a2d]',
  },
];
