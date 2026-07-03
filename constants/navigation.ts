import {
  LayoutDashboard,
  Cloud,
  Settings,
  HelpCircle,
  UtensilsCrossed,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Weather Pipeline', href: '/dashboard/analysis', icon: Cloud },
  { label: 'Competitor Pipeline', href: '/dashboard/competitors', icon: Globe },
  { label: 'Decisions', href: '/dashboard/decisions', icon: ShieldCheck },
  { label: 'Menu Items', href: '/dashboard/menu', icon: UtensilsCrossed },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: 'Help', href: '/help', icon: HelpCircle },
];
