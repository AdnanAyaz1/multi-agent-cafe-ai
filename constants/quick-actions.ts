import { Cloud, BarChart3, Users, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    title: 'Weather Intelligence',
    description: 'Check conditions & impact',
    href: '/dashboard/weather',
    icon: Cloud,
  },
  {
    title: 'Run Analysis',
    description: 'Launch AI pipeline',
    href: '/dashboard/analysis',
    icon: BarChart3,
  },
  {
    title: 'Competitor Insights',
    description: 'Monitor competitors',
    href: '/dashboard/competitors',
    icon: Users,
  },
  {
    title: 'Settings',
    description: 'Manage your cafe',
    href: '/dashboard/settings',
    icon: Settings,
  },
];
