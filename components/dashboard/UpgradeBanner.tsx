'use client';

import Link from 'next/link';
import { Lock, Zap } from 'lucide-react';

interface UpgradeBannerProps {
  feature: string;
  requiredPlan?: 'growth' | 'enterprise';
}

export function UpgradeBanner({ feature, requiredPlan = 'growth' }: UpgradeBannerProps) {
  return (
    <div className="rounded-2xl p-8 text-center border border-[#e07850]/10"
      style={{ background: 'linear-gradient(160deg, rgba(224, 120, 80, 0.04), rgba(14, 12, 10, 0.6))' }}>
      <div className="w-14 h-14 rounded-2xl bg-[#e07850]/10 flex items-center justify-center mx-auto mb-5">
        <Lock className="w-6 h-6 text-[#e07850]" />
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{feature}</h3>
      <p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
        Upgrade to the <span className="text-white font-semibold">{requiredPlan}</span> plan to unlock {feature.toLowerCase()}.
      </p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_24px_-4px_rgba(224,120,80,0.3)]"
        style={{ background: 'linear-gradient(135deg, #e07850, #c86040)' }}
      >
        <Zap className="w-4 h-4" />
        Upgrade Plan
      </Link>
    </div>
  );
}
