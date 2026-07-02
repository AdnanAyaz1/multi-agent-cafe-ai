import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24 lg:py-40 relative">
      <div className="section-divider absolute top-0 left-0 w-full" />

      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="reveal-scale relative rounded-[2rem] overflow-hidden group">
          {/* Base gradient */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #1a1208, #0c0a08, #1a1208)" }} />

          {/* Ambient glow orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] aurora-float"
              style={{ background: "rgba(224, 120, 80, 0.08)", top: "-15%", left: "-5%" }} />
            <div className="absolute w-[350px] h-[350px] rounded-full blur-[90px] aurora-float"
              style={{ background: "rgba(200, 160, 112, 0.05)", bottom: "-10%", right: "5%", animationDelay: "-4s" }} />
          </div>

          {/* Border */}
          <div className="absolute inset-0 rounded-[2rem] pointer-events-none"
            style={{ border: "1px solid rgba(224, 120, 80, 0.12)" }} />

          {/* Content */}
          <div className="relative text-center py-20 lg:py-24 px-8 lg:px-16 z-10">
            <h2 className="text-4xl lg:text-[56px] font-bold text-white mb-6 leading-[1.05] tracking-tight"
              style={{ fontFamily: "var(--font-sora)" }}>
              Ready to grow
              <br />
              <span className="gradient-text">your cafe?</span>
            </h2>
            <p className="text-lg max-w-lg mx-auto mb-12 leading-relaxed"
              style={{ color: "rgba(200, 180, 160, 0.75)" }}>
              Join cafes using AI to make smarter decisions every day. Start your free
              trial — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register"
                className="group relative px-12 py-4 rounded-full text-white font-semibold text-base btn-glow overflow-hidden cursor-pointer"
                style={{ background: "linear-gradient(135deg, #e07850, #c86040)" }}>
                <span className="relative z-10 flex items-center gap-2.5">
                  Start Free Trial
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              <Link href="/auth/login"
                className="px-12 py-4 rounded-full font-medium text-base transition-all duration-400 cursor-pointer"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(200, 180, 160, 0.85)",
                }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
