export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

export const STATS = [
  { value: 5, suffix: "", label: "AI Agents" },
  { value: 24, suffix: "/7", label: "Analysis" },
  { value: 3, suffix: "", label: "Data Sources" },
  { value: 10, suffix: "x", label: "Faster Decisions" },
] as const;

export const FEATURES = [
  {
    icon: "weather",
    title: "Weather Intelligence",
    description:
      "Automatic weather analysis triggers smart pricing. Hot day? Cold drinks get promoted. Rainy morning? Hot beverages take center stage.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: "competitor",
    title: "Competitor Tracking",
    description:
      "AI scrapes competitor menus and promotions daily. Know what they're pricing and how to stay ahead without lifting a finger.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: "agents",
    title: "5-Agent AI Pipeline",
    description:
      "Menu Analyst, Weather Analyst, Strategist, Critic, and Synthesizer work together to produce actionable daily briefings.",
    gradient: "from-indigo-500 to-cyan-500",
  },
] as const;

export const STEPS = [
  {
    number: 1,
    title: "Connect your cafe",
    description: "Sign up, add your menu, and tell us about your competitors.",
  },
  {
    number: 2,
    title: "AI analyzes everything",
    description:
      "Weather data, competitor prices, and your menu are processed by 5 specialized AI agents.",
  },
  {
    number: 3,
    title: "Get daily recommendations",
    description:
      "Wake up to a briefing on what to promote, discount, or hold — with full reasoning.",
  },
  {
    number: 4,
    title: "Approve or adjust",
    description:
      "Small changes auto-approve. Big moves go to your review queue. You're always in control.",
  },
] as const;

export const FOOTER_LINKS = {
  Product: ["Features", "Pricing", "Changelog", "Documentation"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy", "Terms", "Security"],
} as const;
