import { Cloud, Zap, TrendingUp } from 'lucide-react';

export const STATS = [
  { icon: Zap, label: 'Pipeline runs today', value: '3', color: 'text-amber-500' },
  { icon: TrendingUp, label: 'Revenue impact', value: '+12%', color: 'text-green-500' },
  { icon: Cloud, label: 'Weather alerts', value: '1', color: 'text-[#e07850]' },
];

export const ACCENT_MAP = {
  blue: {
    bg: 'bg-[#e07850]/10',
    border: 'border-[#e07850]/20',
    icon: 'text-[#e07850]',
    positive: 'text-green-500',
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: 'text-green-500',
    positive: 'text-green-500',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: 'text-amber-500',
    positive: 'text-green-500',
  },
} as const;
