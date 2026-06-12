'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function useParticleData(count: number, baseSeed: number) {
  return useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: `${seededRandom(baseSeed + i * 4) * 100}%`,
    height: `${20 + seededRandom(baseSeed + i * 4 + 1) * 40}px`,
    duration: 1 + seededRandom(baseSeed + i * 4 + 2) * 1.5,
    delay: seededRandom(baseSeed + i * 4 + 3) * 2,
  })), [count, baseSeed]);
}

function useSnowData(count: number, baseSeed: number) {
  return useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: `${seededRandom(baseSeed + i * 3) * 100}%`,
    duration: 3 + seededRandom(baseSeed + i * 3 + 1) * 4,
    delay: seededRandom(baseSeed + i * 3 + 2) * 3,
  })), [count, baseSeed]);
}

function useStormData(count: number, baseSeed: number) {
  return useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: `${seededRandom(baseSeed + i * 4) * 100}%`,
    height: `${30 + seededRandom(baseSeed + i * 4 + 1) * 60}px`,
    duration: 0.6 + seededRandom(baseSeed + i * 4 + 2) * 0.8,
    delay: seededRandom(baseSeed + i * 4 + 3) * 2,
  })), [count, baseSeed]);
}

function useSunData(count: number, baseSeed: number) {
  return useMemo(() => Array.from({ length: count }, (_, i) => ({
    top: `${15 + seededRandom(baseSeed + i * 4) * 60}%`,
    left: `${10 + seededRandom(baseSeed + i * 4 + 1) * 80}%`,
    duration: 2 + seededRandom(baseSeed + i * 4 + 2) * 2,
    delay: seededRandom(baseSeed + i * 4 + 3) * 3,
  })), [count, baseSeed]);
}

export function WeatherBackground({ condition }: { condition: string }) {
  const lower = condition.toLowerCase();

  const rainData = useParticleData(40, 100);
  const snowData = useSnowData(30, 200);
  const stormData = useStormData(25, 300);
  const sunData = useSunData(6, 400);

  if (lower.includes('rain') || lower.includes('drizzle')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {rainData.map((d, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent"
            style={{ left: d.left, height: d.height }}
            animate={{ y: ['-10vh', '110vh'], opacity: [0, 0.4, 0] }}
            transition={{ duration: d.duration, repeat: Infinity, delay: d.delay, ease: 'linear' }}
          />
        ))}
      </div>
    );
  }

  if (lower.includes('snow')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {snowData.map((d, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/30"
            style={{ left: d.left }}
            animate={{ y: ['-5vh', '105vh'], x: [0, Math.sin(i) * 30], opacity: [0, 0.6, 0] }}
            transition={{ duration: d.duration, repeat: Infinity, delay: d.delay, ease: 'linear' }}
          />
        ))}
      </div>
    );
  }

  if (lower.includes('storm') || lower.includes('thunder')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stormData.map((d, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-amber-500/20 to-transparent"
            style={{ left: d.left, height: d.height }}
            animate={{ y: ['-10vh', '110vh'], opacity: [0, 0.5, 0] }}
            transition={{ duration: d.duration, repeat: Infinity, delay: d.delay, ease: 'linear' }}
          />
        ))}
      </div>
    );
  }

  if (lower.includes('cloud') || lower.includes('overcast') || lower.includes('fog') || lower.includes('mist')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/[0.01]"
            style={{ width: `${200 + i * 100}px`, height: `${100 + i * 50}px`, top: `${20 + i * 25}%`, filter: 'blur(40px)' }}
            animate={{ x: ['-10%', '110%'], opacity: [0, 0.3, 0] }}
            transition={{ duration: 20 + i * 8, repeat: Infinity, delay: i * 5, ease: 'linear' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-10 right-10 w-32 h-32 rounded-full bg-amber-500/5"
        style={{ filter: 'blur(40px)' }}
      />
      {sunData.map((d, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber-500/20"
          style={{ top: d.top, left: d.left }}
          animate={{ opacity: [0, 0.4, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: d.duration, repeat: Infinity, delay: d.delay }}
        />
      ))}
    </div>
  );
}
