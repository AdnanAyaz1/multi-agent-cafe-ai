import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface CompetitorOverviewItem {
  name: string;
  item: string;
  price: string;
  change: 'up' | 'down' | 'same';
  changeAmount: string;
}

export const MOCK_COMPETITORS: CompetitorOverviewItem[] = [
  { name: 'Bean & Brew', item: 'Latte', price: '$5.25', change: 'up', changeAmount: '+$0.50' },
  { name: 'The Grind', item: 'Cold Brew', price: '$4.75', change: 'down', changeAmount: '-$0.25' },
  { name: 'Morning Cup', item: 'Pastry combo', price: '$8.99', change: 'same', changeAmount: '—' },
  { name: 'Drip House', item: 'Espresso', price: '$3.50', change: 'up', changeAmount: '+$0.75' },
];

export const COMPETITOR_CHANGE_ICONS = {
  up: { icon: TrendingUp, color: 'text-red-400', bg: 'bg-red-500/10' },
  down: { icon: TrendingDown, color: 'text-green-500', bg: 'bg-green-500/10' },
  same: { icon: Minus, color: 'text-zinc-400', bg: 'bg-zinc-800' },
};
