# Cafe Intelligence Platform

AI-powered business intelligence for cafes. Daily recommendations on what to promote and discount based on weather, competitors, and menu analysis.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your keys

# Start Redis (Docker)
docker compose up -d redis

# Run dev server (boots workers + scheduler)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```bash
# LLM
GROQ_API_KEY=your-groq-key
GROQ_MODEL=openai/gpt-oss-120b

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bi_platform

# Redis
REDIS_URL=redis://localhost:6379

# Weather (Open-Meteo, no API key needed)
WEATHER_API_URL=https://api.open-meteo.com/v1
```

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Dashboard │────▶│  API Routes  │────▶│   Workers   │
│   (Next.js) │     │              │     │  (BullMQ)   │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                    ┌──────────────┐     ┌───────▼──────┐
                    │  PostgreSQL  │◀───▶│   Redis      │
                    │  (Prisma 7)  │     │  (BullMQ)    │
                    └──────────────┘     └──────────────┘
```

## API Endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/weather` | Fetch weather for a city |
| POST | `/api/analysis/run` | Enqueue 5-agent pipeline |
| GET | `/api/analysis/[pipelineId]` | Poll pipeline status |
| POST | `/api/competitor/refresh` | Enqueue competitor scrape |
| GET | `/api/competitor/[businessId]` | List competitor snapshots |
| GET | `/api/menu/[businessId]` | Read menu items |

## Development

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Test weather worker
npx tsx scripts/test-worker.ts

# Test full pipeline
npx tsx scripts/test-pipeline.ts

# Test competitor scraper
npx tsx scripts/test-competitor.ts "https://example.com/"
```

## Tech Stack

- **Next.js 16** — App Router, Server Components
- **TypeScript** — strict mode, no `any`
- **Groq** — LLM inference (`openai/gpt-oss-120b`)
- **Prisma 7** — PostgreSQL ORM (requires driver adapter)
- **BullMQ + Redis** — Background job queues
- **Crawlee + Playwright** — Competitor web scraping
- **shadcn/ui + Tailwind v4** — UI components + styling
