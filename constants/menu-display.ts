import type { MenuCategory } from '@/constants/menu';

export const CATEGORY_CONFIG: Record<MenuCategory, { label: string; icon: string; color: string }> = {
  'hot-drink': { label: 'Hot Drinks', icon: 'Coffee', color: '#ffd79f' },
  'cold-drink': { label: 'Cold Drinks', icon: 'IceCreamBowl', color: '#00d2ff' },
  food: { label: 'Food', icon: 'Sandwich', color: '#1fe19e' },
  dessert: { label: 'Desserts', icon: 'CakeSlice', color: '#a78bfa' },
};

export const TAG_COLORS: Record<string, string> = {
  signature: '#ffd79f',
  vegetarian: '#1fe19e',
  vegan: '#1fe19e',
  spicy: '#f87171',
  'contains-dairy': '#00d2ff',
  'contains-nuts': '#f87171',
  'gluten-free': '#1fe19e',
};
