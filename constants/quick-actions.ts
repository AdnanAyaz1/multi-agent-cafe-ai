import { Cloud, BarChart3, Users, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  glow: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    title: 'Weather Intelligence',
    description: 'Check conditions & impact',
    href: '/dashboard/weather',
    icon: Cloud,
    gradient: 'from-[#00d2ff] to-[#1fe19e]',
    glow: '#00d2ff',
  },
  {
    title: 'Run Analysis',
    description: 'Launch AI pipeline',
    href: '/dashboard/analysis',
    icon: BarChart3,
    gradient: 'from-[#ffd79f] to-[#f59e0b]',
    glow: '#ffd79f',
  },
  {
    title: 'Competitor Insights',
    description: 'Monitor competitors',
    href: '/dashboard/competitors',
    icon: Users,
    gradient: 'from-[#a78bfa] to-[#818cf8]',
    glow: '#a78bfa',
  },
  {
    title: 'Settings',
    description: 'Manage your cafe',
    href: '/dashboard/settings',
    icon: Settings,
    gradient: 'from-[#859399] to-[#6b7280]',
    glow: '#859399',
  },
];
