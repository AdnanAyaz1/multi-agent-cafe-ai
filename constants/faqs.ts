export const HELP_FAQS = [
  {
    q: 'What is CafePromo AI?',
    a: 'An AI-powered business intelligence platform for cafes. It analyzes weather, sales, competitors, and menus to give you daily recommendations on what to promote and discount.',
  },
  {
    q: 'How does the agent pipeline work?',
    a: 'Five specialized AI agents run in sequence: weather analysis, sales analysis, competitor monitoring, menu optimization, and a synthesizer that produces actionable recommendations.',
  },
  {
    q: 'How do I connect my data?',
    a: 'Go to Settings to configure your business profile. Weather data is pulled automatically via Open-Meteo. Sales and competitor data can be imported through the API.',
  },
  {
    q: 'Can I change or cancel my plan?',
    a: 'Yes. Go to Settings > Subscription to manage your plan. You can upgrade, downgrade, or cancel at any time. Changes take effect immediately.',
  },
  {
    q: 'Is my data secure?',
    a: 'All data is encrypted in transit (TLS) and at rest. We use Neon Postgres with SSL. Stripe handles payment processing — we never store card details.',
  },
] as const;

export const LANDING_FAQS = [
  { q: "How long does setup take?", a: "Most cafes are fully set up in under 5 minutes. Add your menu, paste your competitor URLs, and you're done. The AI learns your business patterns within 24 hours and delivers your first actionable briefing the next morning." },
  { q: "Does it work with my POS system?", a: "CafePromo AI doesn't need direct POS integration to work. You enter your menu items manually (or paste a photo of your menu and we'll digitize it). We're building direct integrations with Square, Toast, and Clover." },
  { q: "How accurate are the AI recommendations?", a: "Our 5-agent system cross-references weather forecasts, competitor pricing, your sales history, and local events. In beta, 78% of recommendations were adopted by cafe owners and resulted in measurable revenue lift." },
  { q: "What's included in the free plan?", a: "The free plan is permanent — no credit card, no time limit. You get 3 AI analyses per day, 1 competitor tracked, and basic weather insights. The Growth plan ($49/mo) unlocks unlimited analyses, 10 competitors, and priority support." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no cancellation fees. Downgrade or cancel from your dashboard in one click. Your data stays available for 30 days after cancellation if you change your mind." },
  { q: "What happens to my data?", a: "Your menu, pricing, and competitor data are encrypted at rest and in transit. We never sell your data. You can export everything or request full deletion at any time." },
  { q: "Do I need technical knowledge?", a: "Not at all. If you can type your menu items and paste a URL, you can use CafePromo AI. The dashboard is designed for cafe owners, not engineers. Daily briefings are written in plain English with clear action items." },
  { q: "Can I use it for multiple locations?", a: "Not yet, but multi-location support is on our roadmap for Q3 2026. Each location will get its own AI agent set with cross-location insights." },
] as const;
