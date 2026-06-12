'use client';

import { motion } from 'framer-motion';
import { Link } from 'lucide-react';
import { QUICK_ACTIONS } from '@/constants/quick-actions';

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {QUICK_ACTIONS.map((action, i) => (
        <motion.div key={action.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}>
          <Link href={action.href} className="glass-card rounded-2xl p-5 block group relative overflow-hidden hover:border-white/[0.15] transition-all duration-500">
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: `${action.glow}15` }} />
            <div className="relative z-10">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <action.icon className="w-5 h-5 text-[#003543]" />
              </div>
              <p className="text-white text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-montserrat)' }}>{action.title}</p>
              <p className="text-[#859399] text-xs flex items-center gap-1.5">
                {action.description}
                <Link className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
