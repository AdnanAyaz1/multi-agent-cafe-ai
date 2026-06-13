"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PricingModal } from "./PricingModal";

export function PricingSection() {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <>
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

          {/* Summary cards with CTA to open modal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto">
            {[
              { name: "Starter", price: "0", period: "forever", highlight: false },
              { name: "Growth", price: "49", period: "/month", highlight: true },
              { name: "Enterprise", price: "199", period: "/month", highlight: false },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`relative rounded-3xl p-8 text-center group cursor-pointer transition-all duration-500 hover:scale-[1.02] ${
                  plan.highlight ? "md:-mt-6 md:mb-6" : ""
                }`}
                style={{
                  background: plan.highlight
                    ? "linear-gradient(160deg, rgba(224, 120, 80, 0.06), rgba(20, 18, 16, 0.9))"
                    : "linear-gradient(160deg, rgba(20, 18, 16, 0.7), rgba(14, 12, 10, 0.5))",
                  border: plan.highlight
                    ? "1px solid rgba(224, 120, 80, 0.15)"
                    : "1px solid rgba(224, 120, 80, 0.05)",
                  backdropFilter: "blur(20px)",
                }}
                onClick={() => setShowPricing(true)}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{ boxShadow: `0 0 60px -15px ${plan.highlight ? 'rgba(224, 120, 80, 0.12)' : 'rgba(224, 120, 80, 0.06)'}` }} />

                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-jetbrains-mono)", background: "linear-gradient(135deg, #e07850, #c86040)" }}>
                    Most Popular
                  </div>
                )}

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-sora)" }}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1 mb-4">
                    <span className="text-sm text-zinc-500">$</span>
                    <span className="text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-sora)" }}>
                      {plan.price}
                    </span>
                    <span className="text-sm text-zinc-500 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-6">Click to view plans & features</p>
                  <div className="h-px w-0 group-hover:w-12 mx-auto transition-all duration-500"
                    style={{ background: plan.highlight ? "rgba(224, 120, 80, 0.3)" : "rgba(224, 120, 80, 0.15)" }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />
    </>
  );
}
