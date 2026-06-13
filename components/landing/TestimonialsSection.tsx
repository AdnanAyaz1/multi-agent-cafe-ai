"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote: "We increased daily revenue by 23% in the first month. The AI picks up on things we never would have noticed — like promoting cold brew on humid afternoons.",
    author: "Sarah Chen",
    role: "Owner, Brew & Bean",
    location: "Portland, OR",
    metric: "+23%",
    metricLabel: "revenue",
    accent: "#e07850",
  },
  {
    quote: "The competitor tracking alone is worth it. We get alerts when nearby cafes change prices, and the AI suggests counter-moves instantly. It's like having a strategist on staff 24/7.",
    author: "Marcus Rodriguez",
    role: "Manager, Sunrise Cafe",
    location: "Austin, TX",
    metric: "12",
    metricLabel: "competitors tracked",
    accent: "#c8a070",
  },
  {
    quote: "I used to spend 2 hours every morning deciding what to promote. Now the AI does it in seconds and it's usually right. My mornings are freed up for what matters.",
    author: "Priya Patel",
    role: "Owner, Chai Corner",
    location: "Chicago, IL",
    metric: "2hrs",
    metricLabel: "saved daily",
    accent: "#e07850",
  },
  {
    quote: "The weather analysis is scarily accurate. It predicted a cold front 3 days out and pre-adjusted our menu. We sold 40% more hot drinks that week.",
    author: "James O'Connor",
    role: "Owner, The Warm Cup",
    location: "Seattle, WA",
    metric: "+40%",
    metricLabel: "hot drink sales",
    accent: "#c8a070",
  },
  {
    quote: "We went from guessing to knowing. Every pricing decision now has data behind it. Our margins improved by 8 points in the first quarter.",
    author: "Aisha Williams",
    role: "Manager, Maven Coffee",
    location: "Denver, CO",
    metric: "+8pts",
    metricLabel: "margin gain",
    accent: "#e07850",
  },
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[active];

  return (
    <section className="py-24 lg:py-40 overflow-hidden relative">
      <div className="section-divider absolute top-0 left-0 w-full" />

      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, rgba(224, 120, 80, 0.3))" }} />
            <p className="text-[10px] uppercase tracking-[0.3em] font-semibold"
              style={{ fontFamily: "var(--font-jetbrains-mono)", color: "#e07850" }}>
              Testimonials
            </p>
          </div>
          <h2 className="text-4xl lg:text-[64px] font-bold text-white mb-6 leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-sora)" }}>
            Loved by cafe <span className="gradient-text">owners</span>
          </h2>
          <p className="text-lg max-w-xl leading-relaxed"
            style={{ color: "rgba(160, 152, 144, 0.7)" }}>
            Join hundreds of cafes already using AI to boost their revenue.
          </p>
        </motion.div>

        {/* Editorial testimonial card — NOT a generic slider */}
        <div className="relative max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-8 lg:p-14 relative overflow-hidden min-h-[380px] flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={active}
                initial={{ x: direction > 0 ? 200 : -200, opacity: 0, filter: "blur(4px)" }}
                animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ x: direction > 0 ? -200 : 200, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
              >
                {/* Top row: quote mark + metric */}
                <div className="flex items-start justify-between mb-8">
                  <span className="text-6xl font-extrabold leading-none" style={{ fontFamily: "var(--font-sora)", color: `${t.accent}15` }}>
                    &ldquo;
                  </span>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold gradient-text" style={{ fontFamily: "var(--font-sora)" }}>
                      {t.metric}
                    </span>
                    <span className="block text-[9px] uppercase tracking-[0.2em] mt-0.5"
                      style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(160, 152, 144, 0.7)" }}>
                      {t.metricLabel}
                    </span>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-lg lg:text-xl leading-relaxed mb-10 max-w-3xl"
                  style={{ color: "rgba(237, 232, 226, 0.8)" }}>
                  {t.quote}
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${t.accent}18, ${t.accent}08)`,
                      border: `1px solid ${t.accent}15`,
                      color: t.accent,
                      fontFamily: "var(--font-sora)",
                    }}>
                    {t.author.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.author}</p>
                    <p className="text-sm" style={{ color: "rgba(160, 152, 144, 0.75)" }}>{t.role}</p>
                    <p className="text-[9px] uppercase tracking-[0.15em] mt-0.5"
                      style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(160, 152, 144, 0.6)" }}>
                      {t.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center gap-2">
              <button onClick={() => { setDirection(-1); setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length); }}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer"
                style={{ border: "1px solid rgba(224, 120, 80, 0.08)", color: "rgba(138, 132, 124, 0.4)" }}
                aria-label="Previous testimonial">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => { setDirection(1); setActive((prev) => (prev + 1) % testimonials.length); }}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer"
                style={{ border: "1px solid rgba(224, 120, 80, 0.08)", color: "rgba(138, 132, 124, 0.4)" }}
                aria-label="Next testimonial">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => { setDirection(i > active ? 1 : -1); setActive(i); }}
                  className="h-1 rounded-full transition-all duration-500 cursor-pointer relative"
                  style={{
                    width: i === active ? "32px" : "6px",
                    background: i === active ? "linear-gradient(90deg, #e07850, #c8a070)" : "rgba(224, 120, 80, 0.12)",
                  }}
                  aria-label={`Go to testimonial ${i + 1}`}>
                  <span className="absolute inset-0 -m-2" />
                </button>
              ))}
            </div>

            <span className="text-[10px] tabular-nums"
              style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(160, 152, 144, 0.7)" }}>
              {String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
