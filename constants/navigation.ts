import {
  LayoutDashboard,
  Cloud,
  Cpu,
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Weather', href: '/weather', icon: Cloud },
  { label: 'Agent Pipeline', href: '/analysis', icon: Cpu },
  { label: 'Competitor Insights', href: '/competitors', icon: TrendingUp },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: 'Help', href: '/help', icon: HelpCircle },
  { label: 'Logout', href: '/logout', icon: LogOut },
];
