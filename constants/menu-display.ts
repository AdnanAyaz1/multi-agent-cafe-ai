import type { MenuCategory } from '@/constants/menu';
import { Coffee, IceCreamBowl, Sandwich, CakeSlice } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const CATEGORY_CONFIG: Record<MenuCategory, { label: string; icon: string; color: string; Icon: LucideIcon }> = {
  'hot-drink': { label: 'Hot Drinks', icon: 'Coffee', color: '#f59e0b', Icon: Coffee },
  'cold-drink': { label: 'Cold Drinks', icon: 'IceCreamBowl', color: '#3b82f6', Icon: IceCreamBowl },
  food: { label: 'Food', icon: 'Sandwich', color: '#22c55e', Icon: Sandwich },
  dessert: { label: 'Desserts', icon: 'CakeSlice', color: '#a855f7', Icon: CakeSlice },
};

export const TAG_COLORS: Record<string, string> = {
  signature: '#f59e0b',
  vegetarian: '#22c55e',
  vegan: '#22c55e',
  spicy: '#ef4444',
  'contains-dairy': '#3b82f6',
  'contains-nuts': '#ef4444',
  'gluten-free': '#22c55e',
};
