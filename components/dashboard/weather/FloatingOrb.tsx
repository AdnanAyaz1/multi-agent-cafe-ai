'use client';

import { motion } from 'framer-motion';

export function FloatingOrb({ color, size, x, y, delay }: { color: string; size: number; x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, filter: 'blur(30px)' }}
      animate={{ y: [0, -15, 0], x: [0, 8, 0], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}
