'use client';

import { useState } from 'react';
import { Settings, CreditCard, ExternalLink } from 'lucide-react';
import { PricingModal } from '@/components/landing/PricingModal';

export default function SettingsPage() {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-zinc-400" />
          <p className="text-[11px] text-zinc-400 uppercase tracking-[0.2em] font-semibold">Settings</p>
        </div>
        <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
          Settings
        </h1>
        <p className="text-zinc-400 text-sm lg:text-base max-w-lg">
          Manage your account, subscription, and preferences.
        </p>
      </div>

      {/* Subscription */}
      <div className="dash-glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="icon-glow w-10 h-10 rounded-xl bg-[#e07850]/10 border border-[#e07850]/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#e07850]" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Subscription</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Manage your plan</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div>
            <p className="text-white text-sm font-semibold">Current Plan</p>
            <p className="text-zinc-500 text-xs mt-0.5">Upgrade or change your subscription</p>
          </div>
          <button
            onClick={() => setShowPricing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#1a1208] transition-all duration-300 hover:shadow-[0_0_20px_-4px_rgba(224,120,80,0.3)]"
            style={{ background: "linear-gradient(135deg, #e07850, #c86040)" }}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Manage Plan
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-600">
          <ExternalLink className="w-3 h-3" />
          <span>Billing managed via Stripe. Update payment methods in the customer portal.</span>
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="dash-glass rounded-2xl p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-6">
          <Settings className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">More Settings Coming Soon</h3>
        <p className="text-zinc-400 text-sm max-w-sm mx-auto">
          Branch config, notification preferences, and API keys will be available here.
        </p>
      </div>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  );
}
