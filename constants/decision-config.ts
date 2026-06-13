import { CheckCircle2, XCircle, Clock, Zap, TrendingDown, TrendingUp, Minus, Trash2 } from 'lucide-react';
import type { DecisionStatus } from '@/types/decisions';

export const STATUS_CONFIG: Record<DecisionStatus, { icon: typeof CheckCircle2; color: string; bg: string; border: string; label: string }> = {
  'auto-approved': { icon: Zap, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Auto-Approved' },
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Pending' },
  approved: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Rejected' },
};

export const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  'auto-approved': Zap,
  approved: CheckCircle2,
  rejected: XCircle,
};

export const STATUS_COLORS: Record<string, string> = {
  'auto-approved': 'text-green-500',
  approved: 'text-green-500',
  rejected: 'text-red-400',
};

export const ACTION_CONFIG: Record<string, { icon: typeof TrendingUp; color: string; border: string; label: string }> = {
  discount: { icon: TrendingDown, color: 'text-[#e07850]', border: 'border-[#e07850]/20', label: 'Discount' },
  promote: { icon: TrendingUp, color: 'text-green-500', border: 'border-green-500/20', label: 'Promote' },
  hold: { icon: Minus, color: 'text-zinc-400', border: 'border-zinc-700/20', label: 'Hold' },
  remove: { icon: Trash2, color: 'text-red-400', border: 'border-red-400/20', label: 'Remove' },
};
