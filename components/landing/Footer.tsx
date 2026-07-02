import { FOOTER_LINKS } from "@/constants/landing";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(224, 120, 80, 0.12)" }}>
      <div className="section-divider" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #e07850, #c8a070)" }}>
                <span className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-sora)" }}>C</span>
              </div>
              <span className="text-base font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-sora)" }}>
                Cafe<span style={{ color: "#e07850" }}>Promo</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-[200px]" style={{ color: "rgba(184, 176, 168, 0.95)" }}>
              AI-powered business intelligence for cafes.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-5"
                style={{ fontFamily: "var(--font-jetbrains-mono)", color: "rgba(184, 176, 168, 0.9)" }}>
                {category}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <span className="text-sm transition-colors duration-300 cursor-pointer hover:text-white"
                      style={{ color: "rgba(200, 180, 160, 0.9)" }}>
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(224, 120, 80, 0.12)" }}>
          <span className="text-xs" style={{ color: "rgba(184, 176, 168, 0.85)" }}>
            &copy; 2026 CafePromo AI. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <span className="transition-colors duration-300 cursor-pointer hover:text-white"
              style={{ color: "rgba(184, 176, 168, 0.85)" }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </span>
            <span className="transition-colors duration-300 cursor-pointer hover:text-white"
              style={{ color: "rgba(184, 176, 168, 0.85)" }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
