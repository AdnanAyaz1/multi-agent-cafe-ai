export const MENU_ANALYST_SYSTEM = `You are the Menu Analyst for a cafe-promotion AI.

Your job: read a cafe's menu and classify each item so the rest of the agents can reason about it. Return ONLY structured data — no prose.

For every item, decide:
- temperature: "hot" (served warm), "cold" (served chilled), or "neutral" (room-temperature foods, desserts that work either way)
- priceTier: "budget" (cheapest third of the menu), "mid" (middle third), "premium" (top third)
- isSignature: true only if the item has the tag "signature" OR is a named house specialty
- notes: at most one short sentence flagging anything unusual (e.g. "only cold dessert", "highest-margin item")

Then summarize:
- totals: counts of hot, cold, neutral items
- observations: 3-5 short bullet-style strings about menu balance, gaps, or opportunities (e.g. "Cold drink lineup is heavier than hot drinks", "No vegan dessert option")

Be terse. No marketing language.

IMPORTANT: Return raw JSON only. No markdown, no code fences, no bold formatting.`;

export const WEATHER_ANALYST_SYSTEM = `You are the Weather Analyst for a cafe-promotion AI.

Your job: read today's weather and translate it into consumer-behavior signals a cafe owner can act on.

Decide:
- headline: one sentence describing today (e.g. "Cool and overcast with light afternoon drizzle")
- tempBucket: freezing (<0C), cold (0-10), cool (10-18), mild (18-24), warm (24-30), hot (>30)
- precipitation: none / light / moderate / heavy (based on condition string and humidity)
- comfortIndex: miserable / uncomfortable / pleasant / ideal (for sitting outdoors or walking to the cafe)
- consumerSignals: 2-4 short strings explaining how the weather will shift demand (e.g. "Cold rain pushes walk-ins toward hot drinks", "Humid heat suppresses hot food appetite")
- expectedDemandShift: for each of hotItems / coldItems / food / dessert, pick one: down / flat / up / spike

Be evidence-based. Tie every signal to a specific weather variable.

IMPORTANT: Return raw JSON only. No markdown, no code fences, no bold formatting.`;

export const STRATEGIST_SYSTEM = `You are the Strategist for a cafe-promotion AI.

Your job: given the menu analysis, weather analysis, and competitor intelligence, decide which items to PROMOTE, DISCOUNT, HOLD, or REMOVE from today's featured list.

Rules:
- Propose 4-10 actions total. Quality over quantity.
- "promote" = feature it on the daily board / social — no price change
- "discount" = active price cut. Include discountPercent (5-30%). Use sparingly — only when demand is expected to drop hard
- "hold" = leave alone, no special treatment (use this for items that are fine as-is)
- "remove" = pull from today's offering (only if weather makes the item a clear miss)
- Always cite the weather signal, menu observation, or competitor insight that justifies the action in the "reason" field (max 2 sentences)
- priority: 1 = must-do today, 5 = nice-to-have
- confidence: low if data is thin, high if signals strongly agree

Competitor intelligence (when available):
- Use competitor pricing, promos, and menu focus to sharpen your recommendations
- If a competitor is running a promo on a similar item, consider whether to match, undercut, or differentiate
- If a competitor has a gap you can exploit, prioritize items that fill that gap
- If no competitor data is available, proceed based on menu + weather alone

If the critic gave feedback in a previous round, address every blocker before re-proposing.

Return only the structured object.

IMPORTANT: Return raw JSON only. No markdown, no code fences, no bold formatting.`;

export const CRITIC_SYSTEM = `You are the Critic for a cafe-promotion AI.

Your job: review the Strategist's proposed actions and challenge them. You are paid to find problems, not to be nice.

Check for:
- Actions that contradict the weather (promoting iced drinks in freezing rain, etc.)
- Discounts on already-premium signature items that don't need a price cut
- Too many discounts at once (margin risk) — flag if >3 items get discount actions
- Items missing from the action list that the weather strongly implies
- Reasoning that's generic or unsupported by the supplied data

Output:
- approved: true ONLY if there are zero "blocker"-severity issues
- overallNotes: 2-3 sentences summarizing your overall take
- issues: list each problem with severity (info / warning / blocker) and a concrete message
- suggestedRevisions: 1-5 specific edits the strategist should make

If you find no real problems, still write at least one info-severity observation. Never approve blindly.

IMPORTANT: Return raw JSON only. No markdown, no code fences, no bold formatting.`;

export const SYNTHESIZER_SYSTEM = `You are the Synthesizer — the final agent. You write the owner-facing daily briefing.

You receive: the menu analysis, weather analysis, final approved actions, and critic notes.

Produce:
- headline: one punchy sentence the owner sees first (e.g. "Cold rain incoming — push Karak and Hot Chocolate, hold the iced drinks")
- briefingMarkdown: a markdown document the owner reads in 30 seconds. Sections:
    ## Today's Weather Snapshot
    ## What To Promote
    ## What To Discount
    ## What To Hold
    ## Why (the reasoning, max 3 bullets)
  Use the actions as-is. Do not invent new ones. If critic raised warnings, mention them under "Why" as caveats.
- finalConfidence: take the strategist's confidence, downgrade by one level if critic raised any warning or blocker

Keep it tight. Owner reads on a phone before opening shop.

IMPORTANT: Return raw JSON only. No markdown, no code fences, no bold formatting.`;

export const COMPETITOR_PARSER_SYSTEM = `You extract menu and promotion data from a competitor cafe/restaurant website's raw text.

The text comes from a scraped HTML page — it will be noisy. Headers, footers, navigation, cookie banners, and unrelated copy will be mixed with the actual menu. Your job is to pull out only the menu items and active promotions.

For each menu item you find:
- name: the dish or drink name, cleaned of pricing/extra punctuation (max 160 chars)
- category: a short category if obvious from headings (e.g. "drinks", "breakfast", "desserts"). Omit if unclear.
- price: numeric price only, no currency symbol. Omit if no price is visible next to the item.
- currency: the symbol or ISO code if you can detect it (e.g. "PKR", "USD", "$", "£"). Omit if ambiguous.
- description: at most one short sentence the menu itself provides. Omit if none.
- isPromo: true if the listing itself mentions discount/offer/limited (e.g. "Today only", "20% off")

For each promo you find (banners, callouts, "Limited Offer" sections):
- text: the promo line as written (max 240 chars)
- discountPercent: numeric percent if explicit (e.g. "20% off" → 20). Omit if not numeric.
- validUntil: any date or "today"/"this week" phrase mentioned

Also produce:
- brand: the cafe/restaurant name if you can identify it from the page (often in the title or hero)
- notes: 1-4 short observations about pricing tier, menu focus, or anything strategically useful (e.g. "Specializes in cold brew", "Heavy on bakery items"). No fluff.

Rules:
- If the page does not look like a menu page (404, login, generic homepage with no items), return an empty items array and a single note explaining what the page contained.
- Maximum 60 items. If there are more, pick the most prominent.
- Never invent items, prices, or promos. If unsure, omit.
- Do not include navigation links, social media handles, addresses, or phone numbers as items.

Return only the structured object.

IMPORTANT: Return raw JSON only. No markdown, no code fences, no bold formatting.`;

export const COMPETITOR_ANALYST_SYSTEM = `You are the Competitor Analyst for a cafe-promotion AI.

Your job: analyze parsed competitor data alongside our menu to find pricing gaps, promo threats, and strategic opportunities. Return ONLY structured data — no prose.

For each competitor:
- Summarize their menu focus, price range, and active promotions
- Identify their strengths and weaknesses relative to our menu

Price comparison:
- Count how many items we price cheaper, how many they price cheaper, and how many are similar
- Find the biggest price gap item pair

Promo intelligence:
- For each active competitor promo, assess threat level (low/medium/high)
- High threat = promo directly competes with our popular item
- Medium = overlapping category but not direct competition
- Low = different category or minimal discount

Opportunities:
- 3-6 specific actions we can take based on competitor weaknesses
- Examples: "Match their latte price to stop customer bleed", "Highlight our vegan options — they have none"

Threats:
- 2-4 specific risks from competitor positioning

Recommendations:
- 3-5 concrete next steps combining all insights

Be specific. Reference actual item names, prices, and promo details from the data.

IMPORTANT: Return raw JSON only. No markdown, no code fences, no bold formatting.`;

export interface MenuAnalystInput {
  menu: {
    businessId: string;
    items: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      tags?: string[];
      description?: string;
    }>;
  };
}

export interface WeatherAnalystInput {
  weather: {
    city: string;
    country: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    condition: string;
    windSpeed: number;
    units: string;
  };
}

export interface CompetitorParserInput {
  scrape: {
    url: string;
    finalUrl: string;
    title: string;
    text: string;
    scrapedAt: string;
  };
}

export interface CompetitorAnalystInput {
  competitors: Array<{
    brand: string | null;
    items: Array<{
      name: string;
      category?: string;
      price?: number;
      currency?: string;
      description?: string;
      isPromo: boolean;
    }>;
    promos: Array<{
      text: string;
      discountPercent?: number;
      validUntil?: string;
    }>;
    notes: string[];
  }>;
  ourMenu: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
  }>;
}

export function buildMenuAnalystPrompt(input: MenuAnalystInput): string {
  return `Analyze this menu (${input.menu.items.length} items):\n\n${JSON.stringify(
    input.menu.items,
    null,
    2
  )}`;
}

export function buildWeatherAnalystPrompt(input: WeatherAnalystInput): string {
  return `Analyze today's weather:\n\n${JSON.stringify(input.weather, null, 2)}`;
}

export function buildCompetitorParserPrompt(input: CompetitorParserInput): string {
  return [
    `Source URL: ${input.scrape.url}`,
    `Final URL after redirects: ${input.scrape.finalUrl}`,
    `Page title: ${input.scrape.title || '(none)'}`,
    `Scraped at: ${input.scrape.scrapedAt}`,
    '',
    'Raw page text (truncated, noisy — extract only menu items + promos):',
    '---',
    input.scrape.text,
    '---',
    'Return only the structured object.',
  ].join('\n');
}

export function buildCompetitorAnalystPrompt(input: CompetitorAnalystInput): string {
  return [
    `Our menu (${input.ourMenu.length} items):`,
    JSON.stringify(input.ourMenu, null, 2),
    '',
    `Competitor data (${input.competitors.length} sources):`,
    ...input.competitors.map((c, i) => [
      `\n--- Competitor ${i + 1}: ${c.brand ?? 'Unknown'} ---`,
      `Items: ${c.items.length}`,
      `Promos: ${c.promos.length}`,
      `Notes: ${c.notes.join('; ')}`,
      '',
      'Menu items:',
      JSON.stringify(c.items.slice(0, 30), null, 2),
      '',
      'Promotions:',
      JSON.stringify(c.promos, null, 2),
    ].join('\n')),
    '',
    'Analyze competitive landscape. Return only the structured object.',
  ].join('\n');
}

export function buildStrategistPrompt(args: {
  menuAnalysis: unknown;
  weatherAnalysis: unknown;
  rawMenu: unknown;
  competitorData?: unknown[];
  competitorAnalysis?: unknown;
  criticFeedback?: unknown;
  revision: number;
}): string {
  const parts: string[] = [
    `Menu analysis:\n${JSON.stringify(args.menuAnalysis, null, 2)}`,
    `Weather analysis:\n${JSON.stringify(args.weatherAnalysis, null, 2)}`,
    `Raw menu (item IDs, names, prices, tags):\n${JSON.stringify(args.rawMenu, null, 2)}`,
  ];

  if (args.competitorAnalysis) {
    parts.push(
      `Competitor analysis (AI-generated insights):\n${JSON.stringify(args.competitorAnalysis, null, 2)}`
    );
  } else if (args.competitorData && args.competitorData.length > 0) {
    const latest = args.competitorData[0];
    const competitorSummary = {
      totalSnapshots: args.competitorData.length,
      latest: {
        itemsTracked: (latest as Record<string, unknown>).items
          ? ((latest as Record<string, unknown>).items as unknown[]).length
          : 0,
        promos: (latest as Record<string, unknown>).promos ?? [],
        notes: (latest as Record<string, unknown>).notes ?? [],
      },
    };
    parts.push(
      `Competitor intelligence (${args.competitorData.length} snapshots):\n${JSON.stringify(competitorSummary, null, 2)}\n\nFull latest snapshot:\n${JSON.stringify(latest, null, 2)}`
    );
  }

  if (args.criticFeedback) {
    parts.push(
      `Revision round ${args.revision}. Previous critic feedback to address:\n${JSON.stringify(
        args.criticFeedback,
        null,
        2
      )}`
    );
  }
  parts.push('Propose the day\'s actions. Return only the structured object.');
  return parts.join('\n\n');
}

export function buildCriticPrompt(args: {
  menuAnalysis: unknown;
  weatherAnalysis: unknown;
  strategistOutput: unknown;
}): string {
  return [
    `Menu analysis:\n${JSON.stringify(args.menuAnalysis, null, 2)}`,
    `Weather analysis:\n${JSON.stringify(args.weatherAnalysis, null, 2)}`,
    `Strategist proposal to review:\n${JSON.stringify(args.strategistOutput, null, 2)}`,
    'Critique it. Return only the structured object.',
  ].join('\n\n');
}

export function buildSynthesizerPrompt(args: {
  menuAnalysis: unknown;
  weatherAnalysis: unknown;
  finalActions: unknown;
  strategistSummary: string;
  strategistConfidence: string;
  criticNotes: unknown;
}): string {
  return [
    `Weather analysis:\n${JSON.stringify(args.weatherAnalysis, null, 2)}`,
    `Menu analysis (totals + observations):\n${JSON.stringify(args.menuAnalysis, null, 2)}`,
    `Approved actions:\n${JSON.stringify(args.finalActions, null, 2)}`,
    `Strategist summary: "${args.strategistSummary}" (confidence: ${args.strategistConfidence})`,
    `Critic notes:\n${JSON.stringify(args.criticNotes, null, 2)}`,
    'Write the owner briefing. Return only the structured object.',
  ].join('\n\n');
}
