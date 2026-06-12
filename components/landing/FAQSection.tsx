"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "How long does setup take?",
    a: "Most cafes are fully set up in under 5 minutes. Add your menu, paste your competitor URLs, and you're done. The AI learns your business patterns within 24 hours and delivers your first actionable briefing the next morning.",
  },
  {
    q: "Does it work with my POS system?",
    a: "CafePromo AI doesn't need direct POS integration to work. You enter your menu items manually (or paste a photo of your menu and we'll digitize it). We're building direct integrations with Square, Toast, and Clover — those will be available later this year.",
  },
  {
    q: "How accurate are the AI recommendations?",
    a: "Our 5-agent system cross-references weather forecasts, competitor pricing, your sales history, and local events. In beta, 78% of recommendations were adopted by cafe owners and resulted in measurable revenue lift. The AI improves over time as it learns your specific customer patterns.",
  },
  {
    q: "What's included in the free trial?",
    a: "The free plan is permanent — no credit card, no time limit. You get 3 AI analyses per day, 1 competitor tracked, and basic weather insights. The Pro plan ($29/mo) unlocks unlimited analyses, 10 competitors, advanced analytics, and priority support.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no cancellation fees. Downgrade or cancel from your dashboard in one click. Your data stays available for 30 days after cancellation if you change your mind.",
  },
  {
    q: "What happens to my data?",
    a: "Your menu, pricing, and competitor data are encrypted at rest and in transit. We never sell your data. You can export everything or request full deletion at any time. We're SOC 2 Type II compliant.",
  },
  {
    q: "Do I need technical knowledge?",
    a: "Not at all. If you can type your menu items and paste a URL, you can use CafePromo AI. The dashboard is designed for cafe owners, not engineers. Daily briefings are written in plain English with clear action items.",
  },
  {
    q: "Can I use it for multiple locations?",
    a: "Not yet, but multi-location support is on our roadmap for Q3 2026. Each location will get its own AI agent set with cross-location insights. Contact us if you have 5+ locations — we're piloting early access.",
  },
];

function FAQItem({ faq, index }: { faq: (typeof faqs)[number]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left group"
        aria-expanded={open}
      >
        <div className="flex items-start gap-4 py-5 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-300">
          {/* Plus/minus icon */}
          <div className="mt-0.5 flex-shrink-0">
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 ${
                open
                  ? "bg-[#00d2ff]/15 rotate-0"
                  : "bg-white/[0.04] group-hover:bg-white/[0.06] rotate-0"
              }`}
            >
              <svg
                className={`w-3.5 h-3.5 transition-colors duration-300 ${
                  open ? "text-[#00d2ff]" : "text-[#859399]"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                )}
              </svg>
            </div>
          </div>

          {/* Question */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-[15px] leading-snug group-hover:text-[#00d2ff] transition-colors duration-200">
              {faq.q}
            </p>

            {/* Answer — animated */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="text-[#859399] text-sm leading-relaxed mt-3 pr-4">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chevron */}
          <motion.svg
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-4 h-4 text-[#859399] flex-shrink-0 mt-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="py-20 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 gradient-bg" />
            <p className="text-[11px] text-[#00d2ff] uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>FAQ</p>
            <div className="h-px w-12 gradient-bg" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-montserrat)" }}>
            Common <span className="gradient-text">questions</span>
          </h2>
          <p className="text-[#859399] text-lg max-w-xl mx-auto">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} faq={faq} index={i} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-10"
        >
          <p className="text-[#859399] text-sm">
            Still have questions?{" "}
            <a href="mailto:support@cafepromo.ai" className="text-[#00d2ff] hover:text-[#1fe19e] font-medium transition-colors">
              Contact us
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
