"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Starter",
    price: "0",
    period: "forever",
    description: "For cafes just getting started with AI.",
    features: [
      "1 AI Agent",
      "Daily weather analysis",
      "Basic recommendations",
      "Email support",
    ],
    cta: "Get Started Free",
    href: "/auth/register",
    popular: false,
    glow: "rgba(0,210,255,0.03)",
  },
  {
    name: "Growth",
    price: "49",
    period: "/month",
    description: "For cafes ready to maximize revenue.",
    features: [
      "5 AI Agents",
      "Competitor tracking",
      "Advanced pricing engine",
      "Auto-approve changes",
      "Priority support",
      "Weekly reports",
    ],
    cta: "Start Free Trial",
    href: "/auth/register",
    popular: true,
    glow: "rgba(0,210,255,0.08)",
  },
  {
    name: "Enterprise",
    price: "199",
    period: "/month",
    description: "For multi-location cafe chains.",
    features: [
      "Unlimited AI Agents",
      "Custom AI training",
      "API access",
      "Multi-location dashboard",
      "Dedicated account manager",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    href: "/auth/register",
    popular: false,
    glow: "rgba(31,225,158,0.03)",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 gradient-bg" />
            <p className="text-[11px] text-[#00d2ff] uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Pricing</p>
            <div className="h-px w-12 gradient-bg" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-montserrat)" }}>
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-[#859399] text-lg max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready to scale.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-3xl p-px ${plan.popular ? "md:-mt-4 md:mb-4" : ""}`}
              style={plan.popular ? {
                background: "linear-gradient(135deg, rgba(0,210,255,0.3), rgba(31,225,158,0.2), rgba(0,210,255,0.1))",
              } : undefined}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#00d2ff] to-[#1fe19e] text-[#003543] text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                  Most Popular
                </div>
              )}

              <div className={`glass-card rounded-3xl p-8 relative overflow-hidden ${plan.popular ? "bg-white/[0.05]" : ""}`}>
                {/* Corner glow */}
                <div
                  className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[80px] pointer-events-none opacity-0 transition-opacity duration-700 hover:opacity-100"
                  style={{ background: plan.glow }}
                />

                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "var(--font-montserrat)" }}>{plan.name}</h3>
                  <p className="text-[#859399] text-sm mb-6">{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-[13px] text-[#859399]">$</span>
                    <span className="text-5xl font-extrabold text-white" style={{ fontFamily: "var(--font-montserrat)" }}>{plan.price}</span>
                    <span className="text-sm text-[#859399] ml-1">{plan.period}</span>
                  </div>

                  <Link
                    href={plan.href}
                    className={`block w-full py-3.5 rounded-xl text-center font-semibold text-sm transition-all duration-300 mb-8 ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#00d2ff] to-[#1fe19e] text-[#003543] hover:shadow-lg hover:shadow-[#00d2ff]/20 hover:-translate-y-0.5"
                        : "border border-white/[0.08] text-white/70 hover:bg-white/[0.04] hover:border-white/[0.15] hover:text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${plan.popular ? "#00d2ff" : "#1fe19e"}15` }}>
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke={plan.popular ? "#00d2ff" : "#1fe19e"} strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm text-white/60">{feature}</span>
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
