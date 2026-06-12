import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  status: 'complete' | 'failed' | 'pending';
  time: string;
}

export const ACTIVITY_STATUS_CONFIG = {
  complete: { icon: CheckCircle2, color: 'text-[#1fe19e]', bg: 'bg-[#1fe19e]/10', border: 'border-[#1fe19e]/15' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/15' },
  pending: { icon: Clock, color: 'text-[#ffd79f]', bg: 'bg-[#ffd79f]/10', border: 'border-[#ffd79f]/15' },
};

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    title: 'Pipeline run completed',
    description: 'Weather + competitor analysis for cafe-001',
    status: 'complete',
    time: '2 hours ago',
  },
  {
    id: '2',
    title: 'Competitor scrape failed',
    description: 'Timeout reaching competitor-cafe.com',
    status: 'failed',
    time: '5 hours ago',
  },
  {
    id: '3',
    title: 'Price alert triggered',
    description: 'Competitor raised latte price by $0.50',
    status: 'complete',
    time: 'Yesterday',
  },
];
