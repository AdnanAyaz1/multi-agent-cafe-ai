"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LANDING_FAQS } from "@/constants/faqs";

function FAQItem({ faq, index }: { faq: (typeof LANDING_FAQS)[number]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <button onClick={() => setOpen(!open)} className="w-full text-left group cursor-pointer" aria-expanded={open}>
        <div className="flex items-start gap-4 py-5 px-6 rounded-2xl transition-all duration-400"
          style={{
            background: open ? "rgba(224, 120, 80, 0.06)" : "transparent",
            border: `1px solid ${open ? "rgba(224, 120, 80, 0.12)" : "transparent"}`,
          }}>
          <div className="mt-0.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{ background: open ? "rgba(224, 120, 80, 0.15)" : "rgba(255,255,255,0.06)" }}>
              <svg className={`w-3.5 h-3.5 transition-all duration-300 ${open ? "rotate-45" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ color: open ? "#e07850" : "rgba(138, 132, 124, 0.35)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] leading-snug transition-colors duration-300"
              style={{ fontFamily: "var(--font-sora)", color: open ? "#ede8e2" : "rgba(237, 232, 226, 0.7)" }}>
              {faq.q}
            </p>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="text-sm leading-relaxed mt-3 pr-4" style={{ color: "rgba(184, 176, 168, 0.8)" }}>
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="py-24 lg:py-40 relative">
      <div className="section-divider absolute top-0 left-0 w-full" />
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(224, 120, 80, 0.3))" }} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#e07850" }}>
              FAQ
            </p>
          </div>
          <h2 className="text-4xl lg:text-[64px] font-bold text-white mb-6 leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-sora)" }}>
            Common <span className="gradient-text">questions</span>
          </h2>
          <p className="text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(184, 176, 168, 0.9)" }}>
            Everything you need to know before getting started.
          </p>
        </motion.div>
        <div className="space-y-1">
          {LANDING_FAQS.map((faq, i) => <FAQItem key={faq.q} faq={faq} index={i} />)}
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }} className="text-center mt-12">
          <p className="text-sm" style={{ color: "rgba(184, 176, 168, 0.9)" }}>
            Still have questions?{" "}
            <a href="mailto:support@cafepromo.ai" className="font-medium transition-colors duration-300"
              style={{ color: "#e07850" }}>Contact us</a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
