'use client';

import { motion } from 'framer-motion';
import type { ToggleProps } from '@/types/dashboard-home';

export function Toggle({ enabled, onToggle, color = '#00d2ff', size = 'md' }: ToggleProps) {
  const w = size === 'sm' ? 'w-9 h-5' : 'w-11 h-6';
  const dot = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <button
      onClick={onToggle}
      className={`${w} rounded-full transition-all duration-300 relative flex-shrink-0 ${
        enabled ? '' : 'bg-white/[0.08]'
      }`}
      style={enabled ? { background: `${color}30`, border: `1px solid ${color}40` } : { border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <motion.div
        className={`${dot} rounded-full absolute top-0.5`}
        style={{ background: enabled ? color : 'rgba(255,255,255,0.2)' }}
        animate={{ x: enabled ? (size === 'sm' ? 14 : 18) : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
