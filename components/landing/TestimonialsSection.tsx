"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote: "We increased daily revenue by 23% in the first month. The AI picks up on things we never would have noticed — like promoting cold brew on humid afternoons.",
    author: "Sarah Chen",
    role: "Owner, Brew & Bean",
    location: "Portland, OR",
    rating: 5,
    metric: "+23%",
    metricLabel: "revenue",
  },
  {
    quote: "The competitor tracking alone is worth it. We get alerts when nearby cafes change prices, and the AI suggests counter-moves instantly. It's like having a strategist on staff 24/7.",
    author: "Marcus Rodriguez",
    role: "Manager, Sunrise Cafe",
    location: "Austin, TX",
    rating: 5,
    metric: "12",
    metricLabel: "competitors tracked",
  },
  {
    quote: "I used to spend 2 hours every morning deciding what to promote. Now the AI does it in seconds and it's usually right. My mornings are freed up for what matters.",
    author: "Priya Patel",
    role: "Owner, Chai Corner",
    location: "Chicago, IL",
    rating: 5,
    metric: "2hrs",
    metricLabel: "saved daily",
  },
  {
    quote: "The weather analysis is scarily accurate. It predicted a cold front 3 days out and pre-adjusted our menu. We sold 40% more hot drinks that week.",
    author: "James O'Connor",
    role: "Owner, The Warm Cup",
    location: "Seattle, WA",
    rating: 5,
    metric: "+40%",
    metricLabel: "hot drink sales",
  },
  {
    quote: "We went from guessing to knowing. Every pricing decision now has data behind it. Our margins improved by 8 points in the first quarter.",
    author: "Aisha Williams",
    role: "Manager, Maven Coffee",
    location: "Denver, CO",
    rating: 5,
    metric: "+8pts",
    metricLabel: "margin gain",
  },
];

const logos = [
  "Brew & Bean", "Sunrise Cafe", "Chai Corner", "The Warm Cup", "Maven Coffee", "The Grind", "Bean Scene", "Morning Cup",
];

export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);

  const next = useCallback(() => {
    setDirection(1);
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[active];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 200 : -200,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -200 : 200,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <section className="py-20 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
            <p className="text-[11px] text-[#00d2ff] uppercase tracking-[0.2em] font-semibold" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>Testimonials</p>
            <div className="h-px w-12 gradient-bg" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-montserrat)" }}>
            Loved by cafe <span className="gradient-text">owners</span>
          </h2>
          <p className="text-[#859399] text-lg max-w-xl mx-auto">
            Join hundreds of cafes already using AI to boost their revenue.
          </p>
        </motion.div>

        {/* Featured testimonial slider */}
        <div className="relative max-w-4xl mx-auto mb-20">
          {/* Ambient glow */}
          <div className="absolute -inset-20 bg-[radial-gradient(ellipse_at_center,rgba(0,210,255,0.04)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative">
            {/* Large quote card */}
            <div className="glass-card rounded-3xl p-8 lg:p-12 relative overflow-hidden min-h-[320px] flex flex-col justify-center">
              {/* Corner glows */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(ellipse_at_top_right,rgba(0,210,255,0.05)_0%,transparent_60%)] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[radial-gradient(ellipse_at_bottom_left,rgba(31,225,158,0.04)_0%,transparent_60%)] pointer-events-none" />

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={active}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10"
                >
                  {/* Stars + metric row */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <svg key={j} className="w-5 h-5 text-[#ffd79f]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold gradient-text" style={{ fontFamily: "var(--font-montserrat)" }}>{t.metric}</span>
                      <span className="block text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{t.metricLabel}</span>
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="text-white/80 text-lg lg:text-xl leading-relaxed mb-8 max-w-2xl">
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#1fe19e] flex items-center justify-center text-[#003543] text-sm font-bold" style={{ fontFamily: "var(--font-montserrat)" }}>
                      {t.author.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{t.author}</p>
                      <p className="text-[#859399] text-sm">{t.role}</p>
                      <p className="text-[10px] text-[#859399] uppercase tracking-wider" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>{t.location}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-8">
              {/* Nav arrows */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/[0.2] hover:bg-white/[0.03] transition-all"
                  aria-label="Previous testimonial"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/[0.2] hover:bg-white/[0.03] transition-all"
                  aria-label="Next testimonial"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > active ? 1 : -1);
                      setActive(i);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active
                        ? "w-8 bg-gradient-to-r from-[#00d2ff] to-[#1fe19e]"
                        : "w-1.5 bg-white/[0.1] hover:bg-white/[0.2]"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              {/* Counter */}
              <span className="text-[11px] text-[#859399] tabular-nums" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
                {String(active + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* Logo bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-center text-[10px] text-[#859399] uppercase tracking-[0.3em] mb-8" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
            Trusted by leading cafes
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {logos.map((logo, i) => (
              <motion.div
                key={logo}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="flex items-center gap-2.5 opacity-30 hover:opacity-60 transition-opacity duration-300"
              >
                <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <span className="text-[10px] font-bold gradient-text" style={{ fontFamily: "var(--font-montserrat)" }}>{logo[0]}</span>
                </div>
                <span className="text-sm text-white/40 font-medium" style={{ fontFamily: "var(--font-montserrat)" }}>{logo}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
