"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePricingCheckout } from "@/hooks/usePricingCheckout";
import { PRICING_PLANS } from "@/constants/pricing";

export function PricingSection() {
  const { handleCheckout } = usePricingCheckout();

  return (
    <section id="pricing" className="py-16 sm:py-24 lg:py-40 relative">
      <div className="section-divider absolute top-0 left-0 w-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 sm:mb-20 lg:mb-28"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="h-px w-8 sm:w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(224, 120, 80, 0.3))" }} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#e07850" }}>
              Pricing
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[56px] xl:text-[64px] font-bold text-white mb-4 sm:mb-6 leading-[1.1] sm:leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-sora)" }}>
            Simple, transparent <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-base sm:text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(184, 176, 168, 0.9)" }}>
            Start free. Upgrade when you&apos;re ready to scale.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-6 items-stretch max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`relative flex flex-col ${plan.popular ? "md:-mt-6 md:mb-6" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 sm:px-5 sm:py-1.5 rounded-full text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider z-10 btn-glow whitespace-nowrap"
                  style={{ fontFamily: "var(--font-jetbrains-mono)", background: "linear-gradient(135deg, #e07850, #c86040)" }}>
                  Most Popular
                </div>
              )}

              <div className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden transition-all duration-500 flex-1 flex flex-col justify-between ${
                plan.popular ? "" : "glass-card"
              }`}
                style={plan.popular ? {
                  background: "linear-gradient(160deg, rgba(224, 120, 80, 0.1), rgba(30, 27, 24, 0.95))",
                  border: "1px solid rgba(224, 120, 80, 0.25)",
                } : undefined}>

                {plan.popular && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[60px] pointer-events-none"
                    style={{ background: "rgba(224, 120, 80, 0.08)" }} />
                )}

                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-sora)" }}>
                    {plan.name}
                  </h3>
                  <p className="text-xs sm:text-sm mb-6 sm:mb-8" style={{ color: "rgba(184, 176, 168, 0.95)" }}>{plan.description}</p>

                  <div className="flex items-baseline gap-1 mb-6 sm:mb-8">
                    <span className="text-sm" style={{ color: "rgba(184, 176, 168, 0.9)" }}>$</span>
                    <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-sora)" }}>
                      {plan.price}
                    </span>
                    <span className="text-xs sm:text-sm ml-1" style={{ color: "rgba(184, 176, 168, 0.9)" }}>{plan.period}</span>
                  </div>

                  {plan.href ? (
                    <Link href={plan.href}
                      className={`block w-full py-3.5 sm:py-4 rounded-2xl text-center font-semibold text-sm transition-all duration-400 mb-6 sm:mb-8 cursor-pointer ${
                        plan.popular ? "text-white btn-glow" : "hover:text-white"
                      }`}
                      style={plan.popular
                        ? { background: "linear-gradient(135deg, #e07850, #c86040)" }
                        : { border: "1px solid rgba(224, 120, 80, 0.15)", background: "rgba(255,255,255,0.04)", color: "rgba(200, 180, 160, 0.9)" }
                      }>
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      onClick={() => plan.planKey && handleCheckout(plan.planKey)}
                      className={`block w-full py-3.5 sm:py-4 rounded-2xl text-center font-semibold text-sm transition-all duration-400 mb-6 sm:mb-8 cursor-pointer ${
                        plan.popular ? "text-white btn-glow" : "hover:text-white"
                      }`}
                      style={plan.popular
                        ? { background: "linear-gradient(135deg, #e07850, #c86040)" }
                        : { border: "1px solid rgba(224, 120, 80, 0.15)", background: "rgba(255,255,255,0.04)", color: "rgba(200, 180, 160, 0.9)" }
                      }>
                      {plan.cta}
                    </button>
                  )}

                  <div className="space-y-3 sm:space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: plan.popular ? "rgba(224, 120, 80, 0.15)" : "rgba(224, 120, 80, 0.08)" }}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            strokeWidth={2.5} style={{ color: plan.popular ? "#e07850" : "rgba(224, 120, 80, 0.5)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm" style={{ color: "rgba(200, 180, 160, 0.85)" }}>{feature}</span>
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
