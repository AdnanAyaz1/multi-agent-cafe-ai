# Project Context

## What This Is

AI-Powered Business Intelligence Platform — a production-grade SaaS app where cafes sign up, subscribe, and get AI-driven pricing/promotion recommendations based on weather, competitors, and menu analysis.

## How It Works (Production Flow)

1. Cafe owner signs up → creates account → selects subscription plan
2. Cafe provides menu (upload or DB connection)
3. System reads menu items (name, category, price, description)
4. Background jobs fetch weather data + scrape competitor sites
5. AI agent pipeline analyzes everything → generates recommendations
6. Price changes ≤10% auto-approve, >10% require human review
7. Full log history + suggestion detail modal for audit trail

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) |
| UI | shadcn/ui + Tailwind v4 |
| AI | Vercel AI SDK + Groq (`openai/gpt-oss-120b`) |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Database | PostgreSQL (Neon) |
| Queue | BullMQ + Redis |
| Scraping | Crawlee + Playwright (headless Chromium) |
| Deployment | Docker Compose (Redis) + local `next dev` |

## Critical Gotchas

- **Next.js 16**: Breaking changes. Read `node_modules/next/dist/docs/` before writing code.
- **Prisma 7**: Requires driver adapter — `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`. No `datasourceUrl`.
- **Groq models**: `llama-3.1-8b-instant` and `llama-3.3-70b-versatile` no longer support `json_schema`. Use `openai/gpt-oss-120b` with `strictJsonSchema: false`.
- **Crawlee + Turbopack**: Import from `@crawlee/playwright` directly, not the `crawlee` umbrella.
- **Lint rule `react-hooks/static-components`**: Can't return JSX from functions called during render. Use conditional rendering or define components at module level.
- **Lint rule `react-hooks/set-state-in-effect`**: Flagging `loadSnapshots()` inside useEffect — pre-existing, not yet fixed.

## Project Structure

```
app/                    # Next.js App Router pages + API routes
components/             # Composed UI blocks (dynamic, props-driven)
components/ui/          # shadcn primitives
hooks/                  # Custom hooks (state + side effects)
lib/                    # Server-only: agents, services, workers, queues, DB, Redis
constants/              # All constants, enums, magic strings
types/                  # TypeScript interfaces/types
utils/                  # Pure business logic functions
context/                # Planning docs (not code)
scripts/                # Test scripts
prisma/                 # Schema + migrations
```

## API Endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/weather` | Fetch weather for a city |
| POST | `/api/analysis/run` | Enqueue 5-agent pipeline → returns `pipelineId` |
| GET | `/api/analysis/[pipelineId]` | Poll pipeline status + AgentRun timeline |
| POST | `/api/competitor/refresh` | Enqueue competitor scrape |
| GET | `/api/competitor/[businessId]` | List competitor snapshots |
| GET | `/api/menu/[businessId]` | Read menu items |

## Lint & Typecheck

```bash
npm run lint        # Must pass clean
npx tsc --noEmit    # Type checking
```

## Pre-existing Issues (Don't Touch)

- `lib/handlers/errors.ts`: prefer-const, no-explicit-any
- `hooks/useAnalysis.ts`: missing useCallback dependency
- `components/dashboard/CompetitorInsights.tsx`: react-hooks/set-state-in-effect
