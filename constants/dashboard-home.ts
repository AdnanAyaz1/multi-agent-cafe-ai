import { Cloud, Zap, TrendingUp, CloudSun, BarChart3, Megaphone, Tag, Thermometer, Activity, Users } from 'lucide-react';

export const STATS = [
  { icon: Zap, label: 'Pipeline runs today', value: '3', color: 'text-amber-500' },
  { icon: TrendingUp, label: 'Revenue impact', value: '+12%', color: 'text-green-500' },
  { icon: Cloud, label: 'Weather alerts', value: '1', color: 'text-[#e07850]' },
];

export const ACCENT_MAP = {
  blue: {
    bg: 'bg-white/[0.04]',
    border: 'border-white/[0.06]',
    icon: 'text-[#e07850]',
    positive: 'text-green-500',
  },
  green: {
    bg: 'bg-white/[0.04]',
    border: 'border-white/[0.06]',
    icon: 'text-green-500',
    positive: 'text-green-500',
  },
  amber: {
    bg: 'bg-white/[0.04]',
    border: 'border-white/[0.06]',
    icon: 'text-amber-500',
    positive: 'text-green-500',
  },
} as const;

export const STAT_WIDGET_ICONS = {
  weather: { icon: CloudSun, accentColor: 'blue' as const },
  items: { icon: BarChart3, accentColor: 'green' as const },
  promos: { icon: Megaphone, accentColor: 'amber' as const },
  discount: { icon: Tag, accentColor: 'blue' as const },
} as const;

export const MENU_STATS_ICONS = {
  total: { icon: BarChart3, color: 'text-[#e07850]' },
  controlled: { icon: Users, color: 'text-green-500' },
  unavailable: { icon: Activity, color: 'text-red-400' },
  categories: { icon: Thermometer, color: 'text-amber-500' },
} as const;
