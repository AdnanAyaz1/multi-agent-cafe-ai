'use client';

import { useState, useEffect } from 'react';
import { Settings, CreditCard, ExternalLink, MapPin, Globe, Sparkles } from 'lucide-react';
import { useSettingsPage } from '@/hooks/useSettingsPage';
import { PricingModal } from '@/components/landing/PricingModal';
import { CafeOnboardingWizard } from '@/components/dashboard/onboarding/CafeOnboardingWizard';

export default function SettingsPage() {
  const { showPricing, setShowPricing, plan, status, planInfo } = useSettingsPage();
  const [businessProfile, setBusinessProfile] = useState<{
    id: string;
    name: string;
    cities: string[];
    competitorUrls: string[];
  } | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const fetchProfile = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.business) {
          setBusinessProfile({
            id: data.business.id,
            name: data.business.name,
            cities: data.business.cities || [],
            competitorUrls: data.business.competitorUrls || [],
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-12 bg-zinc-400" />
          <p className="text-[11px] text-zinc-400 uppercase tracking-[0.2em] font-semibold font-mono">
            Settings
          </p>
        </div>
        <h1 className="text-3xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">
          Settings & Configurations
        </h1>
        <p className="text-zinc-400 text-sm lg:text-base max-w-lg">
          Manage your operational branches, competitor tracking feeds, and subscription.
        </p>
      </div>

      {/* Operational Branches & Competitor Feeds Card */}
      <div className="dash-glass rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="icon-glow w-10 h-10 rounded-xl bg-[#e07850]/10 border border-[#e07850]/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#e07850]" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Operational Branches & Competitors</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                Multi-Branch & Scraping Configuration
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#e07850] to-[#c8a070] text-[#1a1208] transition-all hover:shadow-lg hover:shadow-[#e07850]/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Edit Branches & Competitors
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Operational Cities */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
            <p className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#e07850]" /> Active Operational Cities
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {businessProfile?.cities && businessProfile.cities.length > 0 ? (
                businessProfile.cities.map((city, idx) => (
                  <span
                    key={city}
                    className="px-2.5 py-1 rounded-lg bg-[#e07850]/10 border border-[#e07850]/20 text-[#e07850] text-xs font-semibold"
                  >
                    {city} {idx === 0 && '(HQ)'}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500">No operational cities configured</span>
              )}
            </div>
          </div>

          {/* Competitor URLs */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
            <p className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#e07850]" /> Monitored Competitors
            </p>
            <div className="space-y-1 pt-1">
              {businessProfile?.competitorUrls && businessProfile.competitorUrls.length > 0 ? (
                businessProfile.competitorUrls.slice(0, 3).map((url, i) => (
                  <p key={i} className="text-xs text-zinc-300 truncate">
                    • {url}
                  </p>
                ))
              ) : (
                <span className="text-xs text-zinc-500">No competitor URLs configured</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div className="dash-glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="icon-glow w-10 h-10 rounded-xl bg-[#e07850]/10 border border-[#e07850]/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#e07850]" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Subscription</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                Manage your plan
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
          <div>
            <p className="text-white text-sm font-semibold">Current Plan</p>
            <p className="text-xs mt-1">
              <span className={`font-bold ${planInfo.color}`}>{planInfo.name}</span>
              <span className="text-zinc-500 ml-2">· {status}</span>
            </p>
          </div>
          <button
            onClick={() => setShowPricing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#1a1208] transition-all duration-300 hover:shadow-[0_0_20px_-4px_rgba(224,120,80,0.3)]"
            style={{ background: 'linear-gradient(135deg, #e07850, #c86040)' }}
          >
            <CreditCard className="w-3.5 h-3.5" />
            {plan === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-zinc-600">
          <ExternalLink className="w-3 h-3" />
          <span>Billing managed via Stripe. Update payment methods in the customer portal.</span>
        </div>
      </div>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />

      <CafeOnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialCities={businessProfile?.cities}
        initialCompetitors={businessProfile?.competitorUrls}
        businessId={businessProfile?.id}
        onComplete={fetchProfile}
      />
    </div>
  );
}
