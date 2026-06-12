import {
  LayoutDashboard,
  Cloud,
  Cpu,
  TrendingUp,
  Settings,
  HelpCircle,
  UtensilsCrossed,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Weather', href: '/dashboard/weather', icon: Cloud },
  { label: 'Agent Pipeline', href: '/dashboard/analysis', icon: Cpu },
  { label: 'Decisions', href: '/dashboard/decisions', icon: ShieldCheck },
  { label: 'Menu Items', href: '/dashboard/menu', icon: UtensilsCrossed },
  { label: 'Competitor Insights', href: '/dashboard/competitors', icon: TrendingUp },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: 'Help', href: '/help', icon: HelpCircle },
];
