# AI-Powered Business Intelligence Platform — Architecture

> **Implementation note (2026-06-05):** The plan below is the target. What actually shipped is in `progress.md`. Three deviations from the spec worth flagging:
> 1. **Prisma 7 driver adapter** is now required — the `datasource db { url = env(...) }` pattern still works for migrations, but `new PrismaClient()` in code must use `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`. `lib/db.ts` shows the current shape.
> 2. **Boot pattern is `instrumentation.ts`**, not a custom `lib/scheduler.ts` import in a layout. Next.js 16's `register()` runs once on server start and is the official way to kick off long-running workers.
> 3. **Groq model**: `llama-3.1-8b-instant` and `llama-3.3-70b-versatile` no longer support `json_schema` on Groq (decommissioned 2026-06). Default is now `openai/gpt-oss-120b` with best-effort mode (`strictJsonSchema: false`). See `progress.md` issue #1.

## 1. Vision

An AI operations dashboard for restaurants, cafes, and ecommerce businesses.
Background cron jobs continuously fetch data (weather, competitors, sales, customer
trends). An AI agent pipeline analyzes everything and delivers daily actionable
recommendations — like "Rain expected tomorrow → increase hot drinks by 15%".

This is NOT a one-shot query tool. It's a **persistent, always-on intelligence
system** that learns your business and proactively recommends actions.

---

## 2. What Makes This Different From a Chatbot

| Chatbot | This Platform |
|---|---|
| User asks a question | Agents run on schedule, no user prompting needed |
| One-shot response | Continuous data collection + analysis |
| No memory | Remembers past recommendations, tracks what worked |
| No data sources | Pulls from weather API, sales DB, competitor monitoring |
| Text output | Dashboard with charts, alerts, daily briefings |

---

## 3. Core Features

### 3.1 Data Collection (Background Jobs)
- **Weather service**: Fetch daily forecast for each business location *(shipped)*
- **Competitor monitoring**: Scrape competitor pages (Playwright + Crawlee) and extract menu/promos via LLM *(shipped 2026-06-05)*
- **Sales ingestion**: Pull yesterday's sales data from business DB *(deferred)*
- **Customer trends**: Analyze order patterns, popular items, time-of-day trends *(deferred)*
- **Market events**: Holidays, local events, seasonal patterns *(not started)*

### 3.2 AI Analysis Pipeline
- **Data Analyzer Agent** → built as **Menu Analyst** + **Weather Analyst** (two parallel analysis agents)
- **Recommendation Engine** → built as **Strategist** (accepts critic feedback, re-runs in the orchestrator's revision loop)
- **Critic Agent** → built as **Critic** (exports `criticHasBlockers/Warnings` for the orchestrator to decide whether to loop)
- **Briefing Writer** → built as **Synthesizer** (final brief + action list)
- **Standalone agents** (not part of the orchestrator's pipeline):
  - **Weather Agent** (Path A) — single LLM call + tool, returns typed weather
  - **Competitor Parser** — takes a raw scraped page and returns `{ brand?, items, promos, notes }` (Zod-typed)

### 3.3 Dashboard
- Daily briefing with top recommendations
- Historical recommendations + outcomes
- Data sources status (what's connected, last sync time)
- One-click "Apply recommendation" (future: POS integration)
- Alerts for anomalies (unusual sales drop, competitor price war, etc.)

---

## 4. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 16 (App Router) | SSR dashboard, streaming |
| UI | shadcn/ui + Tailwind v4 | Already configured |
| AI/Agents | Vercel AI SDK + Groq (`openai/gpt-oss-120b`, best-effort `json_schema`) | Already configured, fast inference |
| ORM | Prisma 7 + `@prisma/adapter-pg` | Type-safe DB access; v7 requires driver adapter |
| Database | PostgreSQL (Neon) | Historical data, recommendations, audit trail |
| Queue | BullMQ + Redis | Scheduled jobs, retries, cron |
| Cache/Scheduler | Redis + node-cron | Cron scheduling + caching |
| PDF Reports | @react-pdf/renderer | Daily briefing PDF export *(not yet integrated)* |
| Web Scraping | Crawlee + Playwright (headless Chromium) | Competitor monitoring *(Cheerio was the original plan; switched to Playwright because competitor sites need JS rendering)* |
| Deployment | Docker Compose (Redis container) | Redis is in Docker; app runs locally with `next dev` |

### New Dependencies

```bash
# Database
npm install prisma @prisma/client

# Queue + scheduling
npm install bullmq ioredis node-cron

# PDF generation
npm install @react-pdf/renderer

# Web scraping (competitor monitoring)
npm install cheerio

# Utilities
npm install date-fns uuid
npm install -D @types/uuid
```

---

## 5. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       Next.js App                                │
│                                                                   │
│  ┌────────────┐  ┌─────────────────┐  ┌────────────────────────┐ │
│  │  Dashboard  │  │  API Routes     │  │  Background Services    │ │
│  │  (RSC)     │  │                 │  │                         │ │
│  │            │  │ /api/weather    │  │  ┌──────────────────┐  │ │
│  │  • Briefing│  │ /api/analysis/* │  │  │ Cron Scheduler   │  │ │
│  │  • History │  │ /api/competitor/*│ │  │ (node-cron)      │  │ │
│  │  • Alerts  │  │                 │  │  │                  │  │ │
│  └────┬───────┘  └──────┬──────────┘  │  │ • 6am: weather   │  │ │
│       │                 │             │  │ • 7am: sales      │  │ │
│       │                 │             │  │ • 8am: competitor │  │ │
│       │                 │             │  │ • 9am: AI analysis│  │ │
│       │                 │             │  └─────────┬─────────┘  │ │
│       │                 │             │            │            │ │
│       │                 │             │  ┌─────────▼─────────┐  │ │
│       │                 │             │  │ BullMQ Workers    │  │ │
│       │                 │             │  │                   │  │ │
│       │                 │             │  │ • Weather Worker  │  │ │
│       │                 │             │  │ • Competitor Wk.  │  │ │
│       │                 │             │  │ • Analysis Worker │  │ │
│       │                 │             │  └─────────┬─────────┘  │ │
│       │                 │             └────────────┼────────────┘ │
│       │                 │                          │              │
│  ┌────▼─────────────────▼──────────────────────────▼─────────┐   │
│  │              Agent Pipeline + Standalone Agents            │   │
│  │                                                            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │
│  │  │   Menu   │ │ Weather  │ │Strate-   │ │  Critic  │     │   │
│  │  │  Analyst │→│ Analyst  │→│ gist     │→│  Agent   │     │   │
│  │  └──────────┘ └──────────┘ └────┬─────┘ └────┬─────┘     │   │
│  │                                  │            │            │   │
│  │                                  │ (revisions)│            │   │
│  │                                  │            │            │   │
│  │                                  ▼            ▼            │   │
│  │                          ┌──────────┐  ┌──────────┐       │   │
│  │                          │  Synth-  │  │Competitor│       │   │
│  │                          │  esizer  │  │ Parser   │       │   │
│  │                          └──────────┘  └──────────┘       │   │
│  │  (orchestrator)           (in pipeline) (standalone)      │   │
│  └────────────────────────────────────────────────────────────┘   │
│       │              │              │              │              │
│  ┌────▼──────┐  ┌────▼──────┐  ┌───▼───────┐  ┌─▼──────────┐  │
│  │ PostgreSQL │  │   Redis   │  │  Groq API │  │ External   │  │
│  │ (Prisma 7) │  │ (BullMQ/  │  │  (LLM)    │  │ APIs:      │  │
│  │           │  │  cache)   │  │           │  │ • Open-Meteo│ │
│  └───────────┘  └───────────┘  └───────────┘  │ • Competitor│ │
│                                                │   sites     │  │
│                                                └─────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Data Model (Prisma Schema)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Business Configuration ───────────────────────────────────

model Business {
  id            String   @id @default(uuid())
  name          String
  type          String   // restaurant | cafe | ecommerce
  city          String
  latitude      Float?
  longitude     Float?
  timezone      String   @default("UTC")
  config        Json?    // Flexible config (menu source, POS settings, etc.)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  dataSnapshots DataSnapshot[]
  recommendations Recommendation[]
  alerts        Alert[]
}

// ─── Data Collection ──────────────────────────────────────────

model DataSnapshot {
  id            String   @id @default(uuid())
  businessId    String
  source        String   // weather | sales | competitors | trends
  data          Json     // The actual data payload
  collectedAt   DateTime @default(now())
  expiresAt     DateTime? // Cache expiry

  business      Business @relation(fields: [businessId], references: [id])

  @@index([businessId, source, collectedAt])
}

// ─── AI Recommendations ───────────────────────────────────────

model Recommendation {
  id            String   @id @default(uuid())
  businessId    String
  date          DateTime @default(now())
  summary       String   // "Increase hot drinks by 15% tomorrow"
  reasoning     String   // Full reasoning from AI
  confidence    String   // low | medium | high
  category      String   // pricing | inventory | marketing | operations
  priority      Int      @default(0) // Higher = more important
  status        String   @default("pending") // pending | applied | dismissed | expired
  appliedAt     DateTime?
  outcome       String?  // What actually happened (for learning)

  // Agent outputs for explainability
  dataAnalysis  Json?    // What the Data Analyzer found
  criticNotes   Json?    // What the Critic challenged

  business      Business @relation(fields: [businessId], references: [id])
  actions       RecommendationAction[]

  @@index([businessId, date])
  @@index([businessId, status])
}

model RecommendationAction {
  id              String         @id @default(uuid())
  recommendationId String
  actionType      String         // promote | discount | hold | alert
  item            String         // Item name or "general"
  details         Json           // { discountPercent: 15, reason: "..." }

  recommendation  Recommendation @relation(fields: [recommendationId], references: [id])
}

// ─── Alerts ───────────────────────────────────────────────────

model Alert {
  id            String   @id @default(uuid())
  businessId    String
  type          String   // anomaly | competitor | weather | sales
  severity      String   // info | warning | critical
  title         String
  message       String
  data          Json?    // Supporting data
  read          Boolean  @default(false)
  createdAt     DateTime @default(now())

  business      Business @relation(fields: [businessId], references: [id])

  @@index([businessId, read, createdAt])
}

// ─── Agent Run Log ────────────────────────────────────────────

model AgentRun {
  id            String   @id @default(uuid())
  pipelineId    String   // Groups runs for one analysis cycle
  agentName     String   // data-analyzer | recommender | critic | briefing-writer
  status        String   @default("pending") // pending | running | complete | failed
  input         Json?
  output        Json?
  error         String?
  durationMs    Int?
  tokenCount    Int?
  startedAt     DateTime?
  completedAt   DateTime?
  createdAt     DateTime @default(now())

  @@index([pipelineId])
  @@index([agentName, createdAt])
}

// ─── Scheduled Jobs Config ────────────────────────────────────

model JobSchedule {
  id            String   @id @default(uuid())
  name          String   @unique // weather-fetch | sales-pull | competitor-scrape | daily-analysis
  cronExpression String  // "0 6 * * *" = 6am daily
  enabled       Boolean  @default(true)
  lastRunAt     DateTime?
  nextRunAt     DateTime?
  config        Json?    // Job-specific config
  updatedAt     DateTime @updatedAt
}
```

---

## 7. Background Jobs — The Heart of the System

### 7.1 Job Schedule

| Job | Cron | What It Does |
|---|---|---|
| `weather-fetch` | `0 6 * * *` (6am) | Fetch today's weather for all businesses |
| `sales-pull` | `0 7 * * *` (7am) | Pull yesterday's sales data from business DB |
| `competitor-scrape` | `0 8 * * *` (8am) | Scrape competitor pricing/promotions |
| `trend-analysis` | `0 8 * * *` (8am) | Analyze customer ordering patterns |
| `daily-analysis` | `0 9 * * *` (9am) | Run full AI pipeline → generate recommendations |
| `briefing-send` | `0 9:30 * * *` (9:30am) | Generate + deliver daily briefing |
| `cleanup` | `0 2 * * *` (2am) | Archive old data, clear expired caches |

### 7.2 BullMQ Queue Architecture

```
┌─────────────────────────────────────────────────────┐
│                  BullMQ Queues                       │
│                                                       │
│  ┌──────────────────┐  Priority: 1 (highest)         │
│  │ data-collect     │  ── weather-fetch              │
│  │                  │  ── sales-pull                 │
│  │                  │  ── trend-analysis (TBD)       │
│  └──────────────────┘                                 │
│                                                       │
│  ┌──────────────────┐  Priority: 1                   │
│  │ competitor-collect│  ── competitor-scrape (1 URL) │
│  │                  │  ── (per-URL job, share a      │
│  │                  │     pipelineId for grouping)    │
│  └──────────────────┘                                 │
│                                                       │
│  ┌──────────────────┐  Priority: 2                   │
│  │ ai-analysis      │  ── full-pipeline (5 agents)   │
│  │                  │  ── on-demand-analysis         │
│  └──────────────────┘                                 │
│                                                       │
│  ┌──────────────────┐  Priority: 3                   │
│  │ reports          │  ── briefing-send (TBD)        │
│  │                  │  ── pdf-generation (TBD)       │
│  └──────────────────┘                                 │
└─────────────────────────────────────────────────────┘
```

### 7.3 Worker Implementation Pattern

```typescript
// lib/workers/weather-worker.ts
import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/db';
import { fetchWeatherForecast } from '@/lib/services/weather';

interface WeatherJobData {
  businessId: string;
  city: string;
  latitude?: number;
  longitude?: number;
}

export const weatherWorker = new Worker<WeatherJobData>(
  'data-collect',
  async (job: Job<WeatherJobData>) => {
    const { businessId, city, latitude, longitude } = job.data;

    // Fetch weather from Open-Meteo
    const weather = await fetchWeatherForecast(city, latitude, longitude);

    // Store snapshot
    await prisma.dataSnapshot.create({
      data: {
        businessId,
        source: 'weather',
        data: weather,
        collectedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h TTL
      },
    });

    return { success: true, city, temperature: weather.current.temperature };
  },
  {
    connection: { host: 'localhost', port: 6379 },
    limiter: { max: 10, duration: 60_000 }, // Rate limit: 10 jobs per minute
  }
);
```

```typescript
// lib/workers/competitor-worker.ts — the new pattern (scrape + LLM parse)
import { Worker, type Job } from 'bullmq';
import { prisma } from '@/lib/db';
import { scrapeCompetitorUrl } from '@/lib/services/competitor/client';
import { runCompetitorParser } from '@/lib/agents/competitor-parser';

export const competitorWorker = new Worker(
  'competitor-collect',
  async (job: Job<{ businessId: string; url: string; pipelineId?: string }>) => {
    const { businessId, url } = job.data;
    const pipelineId = job.data.pipelineId ?? randomUUID();

    // 1. Scrape with Crawlee + Playwright (returns cleaned visible text)
    const scrape = await scrapeCompetitorUrl(url, { timeoutMs: 30_000, maxTextLength: 60_000 });

    // 2. Parse with the competitor-parser agent (LLM extraction, Zod-typed)
    const parsed = await runCompetitorParser({ scrape }, { pipelineId, businessId });

    // 3. Persist
    const snapshot = await prisma.dataSnapshot.create({
      data: {
        businessId,
        source: 'competitors',
        data: { url: scrape.url, finalUrl: scrape.finalUrl,
                brand: parsed.output.brand, items: parsed.output.items,
                promos: parsed.output.promos, notes: parsed.output.notes,
                scrapedAt: scrape.scrapedAt },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return { success: true, url, itemCount: parsed.output.items.length,
             promoCount: parsed.output.promos.length, snapshotId: snapshot.id };
  },
  { connection, concurrency: 2, limiter: { max: 6, duration: 60_000 } }
);
```

### 7.4 Cron Scheduler

```typescript
// lib/scheduler.ts
import cron from 'node-cron';
import { researchQueue } from './queues/research-queue';

export function startScheduler() {
  // Fetch weather at 6am daily
  cron.schedule('0 6 * * *', async () => {
    const businesses = await prisma.business.findMany();
    for (const biz of businesses) {
      await researchQueue.add('weather-fetch', {
        businessId: biz.id,
        city: biz.city,
        latitude: biz.latitude,
        longitude: biz.longitude,
      }, { priority: 1 });
    }
  });

  // Run AI analysis at 9am daily
  cron.schedule('0 9 * * *', async () => {
    const businesses = await prisma.business.findMany();
    for (const biz of businesses) {
      await researchQueue.add('daily-analysis', {
        businessId: biz.id,
      }, { priority: 2 });
    }
  });

  // ... more scheduled jobs
}
```

---

## 8. Agent Pipeline

### 8.1 The Four Agents

```
Data Sources                    AI Agents                    Output
─────────────                   ──────────                   ──────

Weather API ─────┐
Sales DB ────────┤
Competitor Scrape┤──→ ┌──────────────┐
Customer Trends ─┘   │ DATA ANALYZER│
                     │              │──→ Structured Findings
                     │ "What        │    { weather: {...},
                     │  happened?"  │      sales: {...},
                     └──────┬───────┘      competitors: {...} }
                            │
                            ▼
                     ┌──────────────┐
                     │  RECOMMENDER │
                     │              │──→ Raw Recommendations
                     │ "What should │    [{ action: "increase",
                     │  we do?"     │       item: "hot drinks",
                     └──────┬───────┘       reason: "..." }]
                            │
                            ▼
                     ┌──────────────┐
                     │    CRITIC    │
                     │              │──→ Validated Recommendations
                     │ "Is this     │    (with challenges resolved)
                     │  sensible?"  │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   BRIEFING   │
                     │   WRITER     │──→ Daily Briefing (Markdown)
                     │              │    + PDF export
                     │ "Tell the    │
                     │  owner"      │
                     └──────────────┘
```

### 8.2 Agent Definitions

| Agent | Model | Input | Output | Purpose |
|---|---|---|---|---|
| **Data Analyzer** | llama-3.1-8b-instant | Raw data snapshots | Structured findings | "What happened yesterday?" |
| **Recommender** | llama-3.3-70b-versatile | Findings + historical recs | Actionable recommendations | "What should we do tomorrow?" |
| **Critic** | llama-3.3-70b-versatile | Recommendations + business rules | Validated recommendations | "Is this sensible and safe?" |
| **Briefing Writer** | llama-3.1-8b-instant | Final recommendations | Executive summary | "Tell the owner in 30 seconds" |

### 8.3 Example Agent Output

```json
{
  "date": "2026-06-03",
  "summary": "Rain expected tomorrow with temperatures dropping to 14°C. "
             "Increase hot drink inventory by 15%. Promote soup combos. "
             "Reduce iced drink stock by 20%.",
  "confidence": "high",
  "recommendations": [
    {
      "action": "increase",
      "item": "Hot Chocolate",
      "category": "inventory",
      "reason": "Temperature dropping 8°C below average, 92% historical "
                "correlation with hot chocolate sales spike",
      "priority": 1
    },
    {
      "action": "promote",
      "item": "Tomato Soup + Bread Combo",
      "category": "marketing",
      "reason": "Rain forecast + lunch rush. Bundle discount of 10% "
                "expected to increase average order value by $3.50",
      "priority": 2
    },
    {
      "action": "reduce",
      "item": "Iced Latte",
      "category": "inventory",
      "reason": "Cold rainy days see 65% drop in iced drink orders. "
                "Reduce stock to avoid waste.",
      "priority": 3
    }
  ],
  "alerts": [
    {
      "type": "competitor",
      "severity": "info",
      "message": "Cafe down the street running 20% off pastries this week"
    }
  ]
}
```

---

## 9. API Routes

| Method | Route | Status | Purpose |
|---|---|---|---|
| `POST` | `/api/weather` | ✅ shipped | Path A — single-shot LLM weather (uses tool) |
| `POST` | `/api/analysis/run` | ✅ shipped | Path C — enqueue 5-agent pipeline → 202 + `pipelineId` |
| `GET` | `/api/analysis/[pipelineId]` | ✅ shipped | Poll for pipeline status (status + AgentRun timeline + Recommendation) |
| `POST` | `/api/competitor/refresh` | ✅ shipped | Enqueue competitor scrape (1 URL or all `Business.config.competitorUrls`) → 202 + `pipelineId` |
| `GET` | `/api/competitor/[businessId]` | ✅ shipped | List `DataSnapshot{source: 'competitors'}` for a business (most recent first, `?limit=N`) |
| `GET` | `/api/menu/[businessId]` | ✅ shipped | Read menu from `MenuSource` |
| `GET` | `/api/dashboard` | ⏳ planned | Dashboard overview (today's briefing, alerts, stats) |
| `GET` | `/api/recommendations` | ⏳ planned | List recommendations (filterable by date, status) |
| `GET` | `/api/recommendations/[id]` | ⏳ planned | Single recommendation with full reasoning |
| `PATCH` | `/api/recommendations/[id]` | ⏳ planned | Update status (apply/dismiss) |
| `GET` | `/api/alerts` | ⏳ planned | List alerts |
| `PATCH` | `/api/alerts/[id]` | ⏳ planned | Mark as read |
| `GET` | `/api/data/[businessId]/[source]` | ⏳ planned | Get latest data snapshot |
| `GET` | `/api/data/[businessId]/history` | ⏳ planned | Historical data for charts |
| `GET` | `/api/analysis/[pipelineId]/stream` | ⏳ planned | SSE stream of analysis progress |
| `GET` | `/api/config/schedules` | ⏳ planned | View job schedules |
| `PATCH` | `/api/config/schedules/[id]` | ⏳ planned | Update schedule |
| `POST` | `/api/reports/[id]/pdf` | ⏳ planned | Generate PDF briefing |

---

## 10. File Structure

```
agentic-ai/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                              # Dashboard home
│   ├── globals.css
│   ├── dashboard/
│   │   ├── page.tsx                          # Main dashboard view
│   │   ├── recommendations/
│   │   │   ├── page.tsx                      # All recommendations
│   │   │   └── [id]/page.tsx                 # Recommendation detail
│   │   ├── alerts/
│   │   │   └── page.tsx                      # Alerts list
│   │   └── data/
│   │       └── [businessId]/page.tsx         # Data sources view
│   ├── api/
│   │   ├── dashboard/route.ts
│   │   ├── recommendations/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── pdf/route.ts
│   │   ├── alerts/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── data/
│   │   │   └── [businessId]/
│   │   │       ├── [source]/route.ts
│   │   │       └── history/route.ts
│   │   ├── analysis/
│   │   │   ├── run/route.ts
│   │   │   └── [pipelineId]/stream/route.ts
│   │   └── config/
│   │       └── schedules/
│   │           ├── route.ts
│   │           └── [id]/route.ts
│   └── components/
│       └── (existing weather components)
│
├── components/
│   ├── ui/                                   # shadcn primitives
│   ├── dashboard/
│   │   ├── daily-briefing.tsx                # Today's recommendations card
│   │   ├── recommendation-card.tsx           # Single rec preview
│   │   ├── recommendation-detail.tsx         # Full rec with reasoning
│   │   ├── alert-list.tsx                    # Alerts sidebar/panel
│   │   ├── alert-badge.tsx                   # Unread alert count
│   │   ├── data-status.tsx                   # Data source health
│   │   ├── stats-overview.tsx                # Key metrics cards
│   │   └── charts/
│   │       ├── sales-trend.tsx               # Sales over time chart
│   │       ├── weather-impact.tsx            # Weather vs sales correlation
│   │       └── recommendation-outcomes.tsx   # Rec success rate
│   ├── layout/
│   │   ├── sidebar.tsx                       # Navigation sidebar
│   │   └── header.tsx                        # Top bar with alerts
│   └── shared/
│       ├── confidence-badge.tsx              # Low/Med/High badge
│       └── source-icon.tsx                   # Weather/Sales/Competitor icon
│
├── hooks/
│   ├── use-dashboard.ts                      # Dashboard data fetching
│   ├── use-recommendations.ts                # Recommendations list
│   ├── use-alerts.ts                         # Alerts with polling
│   └── use-analysis-stream.ts                # SSE for analysis progress
│
├── lib/
│   ├── agents/
│   │   ├── data-analyzer.ts                  # Data Analyzer agent
│   │   ├── recommender.ts                    # Recommendation Engine agent
│   │   ├── critic.ts                         # Critic agent
│   │   ├── briefing-writer.ts                # Briefing Writer agent
│   │   ├── orchestrator.ts                   # Full pipeline orchestration
│   │   ├── prompts.ts                        # All agent prompts (centralized)
│   │   └── types.ts                          # Agent I/O types
│   ├── services/
│   │   ├── weather.ts                        # Open-Meteo API client
│   │   ├── sales.ts                          # Sales data ingestion
│   │   ├── competitor.ts                     # Competitor scraping
│   │   └── trends.ts                         # Customer trend analysis
│   ├── db.ts                                 # Prisma client singleton
│   ├── redis.ts                              # Redis connection singleton
│   ├── queues/
│   │   ├── data-queue.ts                     # Data collection queue
│   │   ├── analysis-queue.ts                 # AI analysis queue
│   │   └── report-queue.ts                   # Report generation queue
│   ├── workers/
│   │   ├── weather-worker.ts                 # Weather data worker
│   │   ├── sales-worker.ts                   # Sales data worker
│   │   ├── competitor-worker.ts              # Competitor scraping worker
│   │   ├── analysis-worker.ts                # AI analysis worker
│   │   └── report-worker.ts                  # PDF generation worker
│   ├── scheduler.ts                          # Cron job scheduler
│   ├── utils.ts                              # cn() + other utils
│   ├── types.ts                              # Shared types
│   └── logger.ts                             # Structured logger
│
├── constants/
│   ├── agents.ts                             # Agent names, model configs
│   ├── schedules.ts                          # Default cron expressions
│   ├── business-types.ts                     # Restaurant/Cafe/Ecommerce configs
│   └── alerts.ts                             # Alert types and severities
│
├── prisma/
│   └── schema.prisma
│
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
├── tsconfig.json
└── context/
    ├── architecture.md                       # This file
    ├── overview.md                           # Project overview
    ├── requirements.md                       # Requirements
    ├── coding-practices.md                   # Coding standards
    └── data-model.md                         # Data model docs
```

---

## 11. Implementation Phases

### Phase 1: Foundation (Days 1-3)
- [ ] Install dependencies (Prisma, BullMQ, ioredis, node-cron, cheerio)
- [ ] Set up Docker Compose (PostgreSQL + Redis)
- [ ] Create Prisma schema + run migrations
- [ ] Create Redis + Prisma singletons
- [ ] Generate shadcn/ui components (Card, Badge, Button, etc.)
- [ ] Update `.env.example` with all new vars
- [ ] Set up basic BullMQ queue + worker connection

### Phase 2: Data Collection Services (Days 4-6)
- [ ] Weather service (Open-Meteo API client)
- [ ] Sales data ingestion (mock data + DB connection pattern)
- [ ] Competitor scraping service (Cheerio-based)
- [ ] Customer trend analysis service
- [ ] Data snapshot storage + caching

### Phase 3: Agent Pipeline (Days 7-9)
- [ ] Data Analyzer agent
- [ ] Recommendation Engine agent
- [ ] Critic agent
- [ ] Briefing Writer agent
- [ ] Pipeline orchestrator
- [ ] Agent prompt tuning (`lib/agents/prompts.ts`)

### Phase 4: Background Jobs (Days 10-11)
- [ ] Cron scheduler setup
- [ ] Weather fetch job
- [ ] Sales pull job
- [ ] Competitor scrape job
- [ ] Daily analysis job
- [ ] Worker error handling + retries

### Phase 5: Dashboard UI (Days 12-15)
- [ ] Dashboard layout (sidebar + header)
- [ ] Daily briefing card
- [ ] Recommendations list + detail views
- [ ] Alerts panel
- [ ] Data status indicators
- [ ] Charts (sales trend, weather impact)
- [ ] SSE streaming for analysis progress

### Phase 6: Polish (Days 16-18)
- [ ] Error handling + typed errors
- [ ] Loading states + skeletons
- [ ] PDF briefing generation
- [ ] Logger integration
- [ ] Rate limiting on API routes
- [ ] On-demand analysis trigger
- [ ] Final testing

---

## 12. Environment Variables

```bash
# .env.example

# ─── LLM ─────────────────────────────────────
GROQ_API_KEY=replace-me
GROQ_MODEL=llama-3.3-70b-versatile

# ─── Database ────────────────────────────────
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bi_platform

# ─── Redis ───────────────────────────────────
REDIS_URL=redis://localhost:6379

# ─── Weather ─────────────────────────────────
# Open-Meteo is free, no API key needed
WEATHER_API_URL=https://api.open-meteo.com/v1

# ─── App ─────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ─── Job Config ──────────────────────────────
WEATHER_FETCH_CRON=0 6 * * *
SALES_PULL_CRON=0 7 * * *
COMPETITOR_SCRAPE_CRON=0 8 * * *
DAILY_ANALYSIS_CRON=0 9 * * *
```

---

## 13. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: bi_platform
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  redisdata:
```

---

## 14. Key Design Decisions

1. **Cron + BullMQ, not just cron** — Cron triggers jobs, BullMQ handles
   retries, concurrency, rate limiting, and monitoring. Best of both worlds.

2. **Data Snapshots with TTL** — Weather data expires in 24h. Sales data
   stays longer. Competitor data has configurable TTL. Prevents stale reads.

3. **Pipeline ID groups agent runs** — Each daily analysis cycle gets a
   unique pipeline ID. All 4 agent runs for that cycle are linked. Easy to
   debug "what went wrong at 9am Tuesday?"

4. **Recommendation status tracking** — Recommendations aren't just output.
   They're tracked: pending → applied → outcome. This enables learning what
   worked.

5. **Alerts as first-class entities** — Not just "things in the dashboard."
   Alerts have severity, read status, and can trigger notifications (email,
   Slack) in v2.

6. **Business config as JSON** — Different business types (cafe vs ecommerce)
   have different data sources and agent configs. JSON field allows flexibility
   without schema changes.

7. **Centralized prompts** — All agent prompts in `lib/agents/prompts.ts`.
   Easy to iterate, A/B test, and version control.

8. **Monolith with module boundaries** — One Next.js app, but clear separation:
   `lib/services/` (data collection), `lib/agents/` (AI), `lib/workers/`
   (background jobs). Extract to microservices only when scaling demands it.
