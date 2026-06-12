'use client';

import type { ToggleProps } from '@/types/dashboard-home';

export function Toggle({ enabled, onToggle, color = '#3b82f6', size = 'md' }: ToggleProps) {
  const w = size === 'sm' ? 'w-9 h-5' : 'w-11 h-6';
  const dot = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const translateX = enabled ? (size === 'sm' ? 'translate-x-[14px]' : 'translate-x-[18px]') : 'translate-x-[2px]';

  return (
    <button
      onClick={onToggle}
      className={`${w} rounded-full transition-all duration-150 relative flex-shrink-0 ${
        enabled ? '' : 'bg-zinc-800'
      }`}
      style={enabled ? { background: `${color}30`, border: `1px solid ${color}40` } : { border: '1px solid #27272a' }}
    >
      <div
        className={`${dot} rounded-full absolute top-0.5 transition-transform duration-150 ${translateX}`}
        style={{ background: enabled ? color : 'rgba(255,255,255,0.2)' }}
      />
    </button>
  );
}
