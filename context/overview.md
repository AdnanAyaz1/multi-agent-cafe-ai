# Cafe Promo & Discount Optimizer

## What it is
A multi-agent AI app that helps subscribed cafes decide **what to promote and what to discount today**, based on the day's weather and the cafe's menu.

## Who it's for
- Cafe owners / managers who subscribe to our service
- Each cafe grants us read access to their menu database
- Each cafe has one (or more) configured location(s) used to fetch weather

## The problem
Cafe owners guess promotions. A hot soup sells better on a cold rainy day; an iced latte sells better when it's 32°C. We turn that intuition into a **reasoned, transparent recommendation** every day.

## How it works (one click)
1. Fetch the cafe's menu from their DB (read-only)
2. Fetch today's weather for the cafe's location
3. Run the multi-agent analysis:
   - **Menu Analyst** — categorizes items (hot/cold/drinks/food/dessert), notes existing prices
   - **Weather Analyst** — summarizes today's weather and seasonal signals
   - **Strategist** — proposes which items to **promote**, which to **discount**, with reasoning
   - **Critic** — challenges the plan, asks for fixes if needed
   - **Synthesizer** — produces the final recommendation
4. Display the recommendation in a clean dashboard with explanations

## Why multi-agent
Each agent has a focused job → better reasoning than one big prompt. The user sees **which agent said what**, so the recommendation is explainable, not a black box.

## Tech stack
- **Next.js 16** (App Router) — UI + API routes
- **TypeScript** — strict mode
- **Groq** (cloud) — LLM inference, OpenAI-compatible API, free tier
- Default model: `llama-3.1-8b-instant` (configurable via `.env`)
- **Tailwind CSS 4** — styling
- **Multi-agent orchestration** — streamed via NDJSON to the client

## LLM provider — swappable
The LLM client lives in `lib/groq.ts` behind a thin interface. Swapping to
Ollama, OpenAI, or another provider later means writing one new client and
leaving the rest of the app untouched. The Greeter agent only knows about
`AgentEvent`s, not the underlying provider.

## Out of scope (v1)
- Applying discounts to the cafe's POS system (we only *recommend*)
- Inventory / stock checking
- Sales history analysis (v1 uses menu + weather only)
- Multi-cafe admin panel (v1 is single-cafe focused)
- Authentication (v1 trusts the configured DB connection)
