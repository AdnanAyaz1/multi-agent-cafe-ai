"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    price: "0",
    period: "forever",
    description: "For cafes just getting started with AI.",
    features: ["1 AI Agent", "Daily weather analysis", "Basic recommendations", "Email support"],
    cta: "Get Started Free",
    href: "/auth/register",
    planKey: null,
    popular: false,
  },
  {
    name: "Growth",
    price: "49",
    period: "/month",
    description: "For cafes ready to maximize revenue.",
    features: ["5 AI Agents", "Competitor tracking", "Advanced pricing engine", "Auto-approve changes", "Priority support", "Weekly reports"],
    cta: "Start Free Trial",
    href: null,
    planKey: "growth" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "199",
    period: "/month",
    description: "For multi-location cafe chains.",
    features: ["Unlimited AI Agents", "Custom AI training", "API access", "Multi-location dashboard", "Dedicated account manager", "Custom integrations"],
    cta: "Contact Sales",
    href: null,
    planKey: "enterprise" as const,
    popular: false,
  },
];

export function PricingSection() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planKey: string) => {
    setLoading(planKey);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      });
      if (res.status === 401) {
        sessionStorage.setItem('pendingCheckout', planKey);
        window.location.href = '/auth/login?checkout=' + planKey;
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(null);
    }
  };
  return (
    <section id="pricing" className="py-24 lg:py-40 relative">
      <div className="section-divider absolute top-0 left-0 w-full" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20 lg:mb-28"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(224, 120, 80, 0.3))" }} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#e07850" }}>
              Pricing
            </p>
          </div>
          <h2 className="text-4xl lg:text-[64px] font-bold text-white mb-6 leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-sora)" }}>
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(160, 152, 144, 0.7)" }}>
            Start free. Upgrade when you&apos;re ready to scale.
          </p>
        </motion.div>

        {/* Pricing — featured center card, NOT equal 3-col */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-start max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`relative ${plan.popular ? "md:-mt-8 md:mb-8" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-white text-[10px] font-bold uppercase tracking-wider z-10 btn-glow"
                  style={{ fontFamily: "var(--font-jetbrains-mono)", background: "linear-gradient(135deg, #e07850, #c86040)" }}>
                  Most Popular
                </div>
              )}

              <div className={`rounded-3xl p-8 lg:p-10 relative overflow-hidden transition-all duration-500 ${
                plan.popular ? "animated-border" : "glass-card"
              }`}
                style={plan.popular ? {
                  background: "linear-gradient(160deg, rgba(224, 120, 80, 0.06), rgba(20, 18, 16, 0.9))",
                } : undefined}>

                {plan.popular && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[60px] pointer-events-none"
                    style={{ background: "rgba(224, 120, 80, 0.06)" }} />
                )}

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-sora)" }}>
                    {plan.name}
                  </h3>
                  <p className="text-sm mb-8" style={{ color: "rgba(160, 152, 144, 0.55)" }}>{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-10">
                    <span className="text-sm" style={{ color: "rgba(160, 152, 144, 0.5)" }}>$</span>
                    <span className="text-6xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-sora)" }}>
                      {plan.price}
                    </span>
                    <span className="text-sm ml-1" style={{ color: "rgba(160, 152, 144, 0.5)" }}>{plan.period}</span>
                  </div>

                  {plan.href ? (
                    <Link href={plan.href}
                      className={`block w-full py-4 rounded-2xl text-center font-semibold text-sm transition-all duration-400 mb-10 cursor-pointer ${
                        plan.popular ? "text-white btn-glow" : "hover:text-white"
                      }`}
                      style={plan.popular
                        ? { background: "linear-gradient(135deg, #e07850, #c86040)" }
                        : { border: "1px solid rgba(224, 120, 80, 0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(200, 180, 160, 0.7)" }
                      }>
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      onClick={() => plan.planKey && handleCheckout(plan.planKey)}
                      disabled={loading === plan.planKey}
                      className={`block w-full py-4 rounded-2xl text-center font-semibold text-sm transition-all duration-400 mb-10 cursor-pointer disabled:opacity-50 ${
                        plan.popular ? "text-white btn-glow" : "hover:text-white"
                      }`}
                      style={plan.popular
                        ? { background: "linear-gradient(135deg, #e07850, #c86040)" }
                        : { border: "1px solid rgba(224, 120, 80, 0.08)", background: "rgba(255,255,255,0.02)", color: "rgba(200, 180, 160, 0.7)" }
                      }>
                      {loading === plan.planKey ? 'Redirecting...' : plan.cta}
                    </button>
                  )}

                  <div className="space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: plan.popular ? "rgba(224, 120, 80, 0.12)" : "rgba(224, 120, 80, 0.05)" }}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            strokeWidth={2.5} style={{ color: plan.popular ? "#e07850" : "rgba(224, 120, 80, 0.5)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm" style={{ color: "rgba(200, 180, 160, 0.6)" }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
