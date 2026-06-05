# Project Progress Log

> Living document. Updated as we build. Tracks dry runs, decisions, current state, and issues hit + fixes.

---

## Current State (2026-06-05)

| Phase | Status |
|---|---|
| Phase 1 — Foundation | ✅ Complete |
| Phase 2 — Data Collection | ✅ Weather + Competitors live (sales + trends still deferred) |
| Phase 3 — Agent Pipeline | ✅ Complete (5 weather-flow agents + 1 competitor-parser agent) |
| Phase 4 — Background Jobs | ✅ Weather, Competitor, Analysis queues all live |
| Phase 5 — Dashboard UI | 🚧 Minimal (Analysis panel + Weather panel + new Competitor route, no UI yet) |
| Phase 6 — Polish | ⏳ Not started |

TODO 1 (Greeter agent) — **skipped** per user decision. TODO 3 (sales) and TODO 5 (trend analysis) — **deferred** per user. TODO 4 (competitor scraping) — **shipped 2026-06-05**.

---

## Dry Run: Competitor Worker End-to-End (tested ✅, 2026-06-05)

### Cold start
```
1. next dev starts
2. Next.js calls instrumentation.ts:register()
3. register() checks NEXT_RUNTIME === 'nodejs' → yes
4. dynamic-imports lib/workers/weather-worker.ts
5. dynamic-imports lib/workers/analysis-worker.ts
6. dynamic-imports lib/workers/competitor-worker.ts  ← NEW
7. dynamic-imports lib/scheduler.ts and calls startScheduler()
   → 4 cron jobs registered: weather-fetch, sales-pull, competitor-scrape, daily-analysis
8. Console: [boot] workers and scheduler initialized
9. Redis CLIENT LIST shows 3 bull workers bzpopmin:ing:
   - bull:ZGF0YS1jb2xsZWN0   (data-collect)
   - bull:YWktYW5hbHlzaXM=   (ai-analysis)
   - bull:Y29tcGV0aXRvci1jb2xsZWN0  (competitor-collect)
```

### Single job lifecycle (verified with `scripts/test-competitor.ts`)
```
1. Producer (test script) upserts Business "test-biz-1" with config.competitorUrls = [target URL]
2. Producer: competitorCollectQueue.add('competitor-scrape', { businessId, url, pipelineId })
   → Redis: LPUSH bull:competitor-collect:waiting <job-hash>
3. Worker (in dev server process) blocks on BZPOPMIN
4. Worker receives job → moves to bull:competitor-collect:active
5. Worker calls scrapeCompetitorUrl(url)
   → Crawlee PlaywrightCrawler launches headless Chromium
   → navigates, strips <script>/<style>/<noscript>, returns visible text
   → ~4s for example.com
6. Worker calls runCompetitorParser({ scrape }, { pipelineId, businessId })
   → competitor-parser agent (groq → openai/gpt-oss-120b) extracts:
     { brand?, items: CompetitorMenuItem[], promos: CompetitorPromo[], notes: string[] }
   → ~4s, 1123 tokens (best-effort json_schema, strictJsonSchema: false)
7. Worker composes CompetitorData and writes DataSnapshot{source: 'competitors', expiresAt: +24h}
8. Worker writes AgentRun{ agentName: 'competitor-parser', pipelineId, status: 'complete', durationMs, tokenCount }
9. Job moves to bull:competitor-collect:completed
10. Console: [competitor-worker] job N completed — items=0 promos=0 (example.com is empty)
11. Test script queries DB:
    → 1 snapshot in DataSnapshot{source: 'competitors'} for test-biz-1
    → 1 AgentRun row [complete] 3965ms, 1123 tokens
```

### API smoke test (also passed)
```
POST /api/competitor/refresh  body: {"businessId":"test-biz-1"}
  → 202 { pipelineId, businessId, enqueued: [{jobId, url}], message }
GET  /api/competitor/test-biz-1?limit=5
  → 200 { businessId, businessName, count, snapshots: [{id, collectedAt, data, ...}] }
```

### Cron path (verified by scheduler boot log)
```
08:00 daily → cron fires competitor-scrape
            → prisma.business.findMany() → for each:
            → competitorCollectQueue.add('competitor-scrape', { businessId, url, pipelineId }, priority 1)
            → (rest of lifecycle as above, each URL = one job, all share one pipelineId)
```

---

## Dry Run: Weather Worker End-to-End (tested ✅)

---

## Dry Run: Weather Worker End-to-End (tested ✅)

### Cold start
```
1. next dev starts
2. Next.js calls instrumentation.ts:register()
3. register() checks NEXT_RUNTIME === 'nodejs' → yes
4. dynamic-imports lib/workers/weather-worker.ts
   → top-level `new Worker('data-collect', ...)` opens BullMQ subscription on Redis
5. dynamic-imports lib/scheduler.ts and calls startScheduler()
   → 4 cron jobs registered via node-cron
6. Console output:
   [scheduler] registered weather-fetch (0 6 * * *)
   [scheduler] registered sales-pull (0 7 * * *)
   [scheduler] registered competitor-scrape (0 8 * * *)
   [scheduler] registered daily-analysis (0 9 * * *)
   [boot] workers and scheduler initialized
```

### Single job lifecycle (verified with `scripts/test-worker.ts`)
```
1. Producer (test script) creates Business "Test Cafe" in Postgres (Prisma + PrismaPg adapter)
2. Producer: dataCollectQueue.add('weather-fetch', { businessId, city: 'Tokyo' })
   → Redis: LPUSH bull:data-collect:waiting <job-hash>
3. Worker (in dev server process) blocks on BRPOP
4. Worker receives job → moves to bull:data-collect:active
5. Worker calls fetchWeather('Tokyo')
   → Open-Meteo geocoding API (lat/lon)
   → Open-Meteo forecast API (current weather)
6. Worker calls prisma.dataSnapshot.create({ source: 'weather', data: {...}, ttl: 24h })
7. Worker returns { success: true, city: 'Tokyo', temperature }
8. Job moves to bull:data-collect:completed (kept 7 days by default)
9. Console: [weather-worker] job N completed for Tokyo
```

Result: 2 jobs enqueued, both completed in <5s each.

### Cron → queue → worker (the "scheduled" path)
```
06:00 daily → cron fires
            → scheduler.weather-fetch.run()
            → prisma.business.findMany() → for each business:
            → dataCollectQueue.add('weather-fetch', { businessId, city, lat?, lon? }, { priority: 1 })
            → (rest of lifecycle as above)
```

---

## Issues Hit + Fixes

### 1. Groq model decommissioning (2026-06-05) — `llama-3.1-8b-instant` and `llama-3.3-70b-versatile` no longer support `json_schema`
**Symptom:** Every `generateObject` call failed with `AI_APICallError: This model does not support response format 'json_schema'`. Broke the competitor-parser, the menu/weather/strategist/critic/synthesizer pipeline, and the sync weather agent.
**Root cause:** Groq's structured-outputs support list shrunk. As of 2026-06-05 only `openai/gpt-oss-{20b,120b}`, `openai/gpt-oss-safeguard-20b`, and `meta-llama/llama-4-scout-17b-16e-instruct` support `json_schema` (best-effort or strict).
**Fix (two-part):**
1. **`lib/agents/models.ts`** — `DEFAULT_MODEL` → `openai/gpt-oss-120b` (per-agent `MODEL_*` env vars still work).
2. **`lib/agents/run.ts`** — pass `providerOptions: { groq: { structuredOutputs: true, strictJsonSchema: false } }` to every `generateObject` call. This uses Groq's best-effort mode (constraints not required), so existing Zod schemas with `.optional()` fields keep working without restructuring.
**Why not restructure all schemas for strict mode?** Our schemas use `.optional()` everywhere. Strict mode would force every optional into `required + nullable` — a big diff for no real win. Best-effort mode + Zod validation after the LLM returns is the right tradeoff for this app (we already validate with the same Zod schema inside `generateObject`).
**Caveat:** Best-effort can occasionally return syntactically-valid-but-schema-invalid JSON. We have retries (`retries: 1` default in `withAgentRun`) and `withAgentRun` will re-call on error. So in practice the failure rate is low.

### 2. Turbopack can't bundle `crawlee` (2026-06-05) — dynamic `require('playwright')` inside crawlee's launcher
**Symptom:** `competitor-worker` boot compiled fine, but every job failed with `Cannot find module as expression is too dynamic` thrown from `BrowserLauncher.requireLauncherOrThrow` → `new PlaywrightLauncher` → `new PlaywrightCrawler`.
**Root cause:** `crawlee`'s meta-package re-exports from `@crawlee/puppeteer`, which on module load does `require.resolve('puppeteer/package.json')` to detect the CDP version. Puppeteer isn't installed (we use Playwright). Turbopack's static analyzer can't resolve the dynamic `require('playwright')` default in `PlaywrightLauncher`'s constructor.
**Fix:** Import directly from `@crawlee/playwright` and `@crawlee/core` (not the `crawlee` umbrella) and pass `launchContext.launcher = chromium` explicitly. This bypasses crawlee's `requireLauncherOrThrow('playwright', ...)` call entirely.
**Files changed:** `lib/services/competitor/client.ts` (one import line + one new `launcher: chromium` field).

### 3. Prisma 7 — `datasourceUrl` no longer valid
**Error:** `Unknown property datasourceUrl provided to PrismaClient constructor`
**Fix:** Installed `@prisma/adapter-pg`, rewrote `lib/db.ts` to:
```ts
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });
```
**Why:** Prisma 7 requires a **driver adapter** — the old URL-on-schema pattern is gone. The valid `PrismaClientOptions` in v7 are: `errorFormat`, `log`, `transactionOptions`, `adapter`, `accelerateUrl`. No `datasourceUrl`, no `datasources`.

### 2. Worker died with dev server
**Symptom:** `waitUntilFinished` in test script timed out at 30s.
**Root cause:** Bash tool's 20s timeout killed the dev server, which was hosting the worker (top-level `new Worker(...)` side effect).
**Fix:** Started dev server detached via `Start-Process cmd.exe /c "npm run dev"` so it survives the shell session.
**Note for production:** On Vercel, serverless functions don't host long-running workers. The worker would need its own host (Railway, Fly.io, EC2, etc.) or Vercel Cron + queue pattern.

### 3. PostgreSQL driver not installed
**Error:** "Cannot find module '@prisma/adapter-pg'" when instrumented worker tried to import Prisma.
**Fix:** `npm install @prisma/adapter-pg`

### 4. docker-compose had a Postgres service but user has local Postgres
**Fix:** Edited `docker-compose.yml` to keep only the Redis service.

---

## File Map (current)

| File | Role |
|---|---|
| `app/page.tsx` | Home — renders `<WeatherDisplay />` + `<AnalysisPanel />` |
| `app/api/weather/route.ts` | `POST` → Zod-validate → `getWeatherData` → JSON (inline error handling) |
| `app/api/menu/[businessId]/route.ts` | `GET` → menu for a business |
| `app/api/analysis/run/route.ts` | `POST` → enqueues a pipeline; returns `pipelineId` (HTTP 202) |
| `app/api/analysis/[pipelineId]/route.ts` | `GET` → AgentRun timeline + Recommendation (poll target) |
| `app/api/competitor/refresh/route.ts` | `POST` → enqueues competitor scrape (HTTP 202) |
| `app/api/competitor/[businessId]/route.ts` | `GET` → list `DataSnapshot{source: 'competitors'}` for a business |
| `instrumentation.ts` | Boot: imports three workers, starts scheduler (Node only) |
| `lib/db.ts` | Prisma 7 client (uses `@prisma/adapter-pg`) |
| `lib/redis.ts` | ioredis singleton (globalThis pattern) |
| `lib/logger.ts` | Structured logger with `child(scope)` |
| `lib/errors.ts` | `AppError` + 5 typed subclasses |
| `lib/validators/weather.ts` | Zod schema for `/api/weather` body |
| `lib/validators/analysis.ts` | Zod schemas for `/api/analysis/run` body + pipelineId |
| `lib/validators/competitor.ts` | Zod schemas for `/api/competitor/refresh` body + snapshot query |
| `lib/agents/weather-agent.ts` | Path A — Groq + weather tool, returns `{ data } \| { error }` |
| `lib/agents/tools/weatherTool.ts` | Zod-validated tool wrapping `fetchWeather` |
| `lib/agents/types.ts` | Zod schemas for every pipeline agent output (6 agents now) |
| `lib/agents/prompts.ts` | Centralized system prompts + prompt builders (incl. COMPETITOR_PARSER_SYSTEM) |
| `lib/agents/models.ts` | Per-agent model picker; default `openai/gpt-oss-120b` |
| `lib/agents/run.ts` | `withAgentRun()` — wraps `generateObject` with AgentRun DB logging + retries + Groq best-effort `json_schema` |
| `lib/agents/menu-analyst.ts` | Pipeline agent 1 |
| `lib/agents/weather-analyst.ts` | Pipeline agent 2 |
| `lib/agents/strategist.ts` | Pipeline agent 3 (accepts critic feedback for revisions) |
| `lib/agents/critic.ts` | Pipeline agent 4 (+ `criticHasBlockers/Warnings`) |
| `lib/agents/synthesizer.ts` | Pipeline agent 5 (+ `deriveFinalConfidence`) |
| `lib/agents/competitor-parser.ts` | Standalone competitor agent (brand + items + promos + notes) |
| `lib/agents/orchestrator.ts` | The 5-agent state machine + revision loop + persistence |
| `lib/services/weather/client.ts` | Open-Meteo geocoding + forecast |
| `lib/services/competitor/client.ts` | Crawlee + Playwright headless scrape (text-only) |
| `lib/queues/data-queue.ts` | 4 BullMQ queues (`data-collect`, `ai-analysis`, `reports`, `competitor-collect`) |
| `lib/workers/weather-worker.ts` | Weather job processor |
| `lib/workers/analysis-worker.ts` | AI pipeline processor (concurrency 2, rate-limited) |
| `lib/workers/competitor-worker.ts` | Competitor scrape+parse processor (concurrency 2, rate-limit 6/min) |
| `lib/scheduler.ts` | Cron jobs: `weather-fetch` (6am), `sales-pull` (7am, stub), `competitor-scrape` (8am), `daily-analysis` (9am) |
| `lib/menu/*` | Menu source (JSON), cache, types |
| `hooks/useWeather.ts` | Path A client hook |
| `hooks/useAnalysis.ts` | Path C client hook (run + poll + cancel) |
| `components/dashboard/WeatherDisplay.tsx` | Path A UI |
| `components/dashboard/AnalysisPanel.tsx` | Path C UI (button + timeline + briefing) |
| `scripts/test-worker.ts` | E2E test for the weather worker |
| `scripts/test-pipeline.ts` | E2E test for the full agent pipeline |
| `scripts/test-competitor.ts` | E2E test for competitor scrape + parse (enqueue → DB query) |
| `scripts/test-scraper-only.ts` | Direct scrape (no LLM) |

---

## Architecture Decisions (so far)

1. **Prisma 7 driver adapter** (mandatory) — `@prisma/adapter-pg`
2. **Custom error classes** for API-side error handling (no frontend error boundary)
3. **Zod schemas** in `lib/validators/<feature>.ts`
4. **Inline try/catch in routes** — the old `apiHandler()` HOF was removed because Next.js 16's `RouteContext<'/path'>` doesn't play with a generic wrapper (see `flow-walkthrough.md` step 4 explainer)
5. **`globalThis` pattern** on Redis client, Prisma client, all three workers, and scheduler to survive HMR
6. **`instrumentation.ts`** (Next.js 16 official) for boot code — runs once on server start, registers all workers
7. **No `datasourceUrl`** anywhere — Prisma 7 reads from adapter only
8. **Workers co-located with Next.js** in dev (single process); will need separate process in production
9. **`generateObject` with Zod schemas** for every pipeline agent — typed outputs, no string parsing
10. **`AgentRun` per LLM call** (not per pipeline) — granular timing, independent failures, revision-loop visibility
11. **HTTP 202 + polling** for pipeline status — survives load balancers, no SSE state to manage
12. **`pipelineId` UUID** generated server-side, stored in `Recommendation.dataAnalysis.pipelineId` for back-lookup
13. **Bounded critic revisions** (`MAX_REVISIONS` env, default 1) — prevents ping-pong between Strategist and Critic
14. **Direct `@crawlee/playwright` import** (not the `crawlee` umbrella) — sidesteps Turbopack's inability to bundle crawlee's dynamic `require('playwright')`/`require('puppeteer')`. We pass `launchContext.launcher = chromium` explicitly so crawlee's `requireLauncherOrThrow` is never called.
15. **Groq best-effort `json_schema`** — `providerOptions.groq = { structuredOutputs: true, strictJsonSchema: false }` on every `generateObject`. Lets our `.optional()`-heavy Zod schemas keep working without converting every optional to `required + nullable`.
16. **Competitor URLs in `Business.config.competitorUrls`** — flexible JSON config (no schema migration) lets each business own their own list. The API accepts a `url` override for one-off scrapes.

---

## Test Commands

```bash
# Start dev server detached (boots both workers + scheduler)
Start-Process cmd.exe /c "npm run dev" -WorkingDirectory "D:\Github\AGENTIC AI\agentic-ai"

# Tail logs
Get-Content "D:\Github\AGENTIC AI\agentic-ai\dev.log" -Wait

# Test Path A (on-demand LLM weather)
curl -X POST http://localhost:3000/api/weather -H "content-type: application/json" -d '{"city":"London"}'

# Test Path B (weather worker only)
npx tsx scripts/test-worker.ts

# Test Path C (full agentic pipeline)
npx tsx scripts/test-pipeline.ts

# Trigger Path C via HTTP and poll
$pipe = curl -X POST http://localhost:3000/api/analysis/run -H "content-type: application/json" -d '{"businessId":"test-biz-1"}' | ConvertFrom-Json
curl http://localhost:3000/api/analysis/$($pipe.pipelineId)

# Test competitor scraper directly (no LLM, fastest sanity check)
npx tsx scripts/test-scraper-only.ts "https://example.com/"

# Test full competitor pipeline (scrape + LLM parse + DB persist)
npx tsx scripts/test-competitor.ts "https://example.com/"

# Trigger competitor refresh via HTTP and list snapshots
$pipe = curl -X POST http://localhost:3000/api/competitor/refresh -H "content-type: application/json" -d '{"businessId":"test-biz-1"}' | ConvertFrom-Json
curl "http://localhost:3000/api/competitor/test-biz-1?limit=5"

# Check Redis queues
docker exec agentic-ai-redis-1 redis-cli LLEN bull:data-collect:completed
docker exec agentic-ai-redis-1 redis-cli LLEN bull:ai-analysis:completed
docker exec agentic-ai-redis-1 redis-cli LLEN bull:ai-analysis:failed
docker exec agentic-ai-redis-1 redis-cli LLEN bull:competitor-collect:completed
docker exec agentic-ai-redis-1 redis-cli LLEN bull:competitor-collect:failed
```

---

## Next Steps

1. **Validate Path C in production-like run** — confirm Groq free-tier rate limits hold under back-to-back pipelines (now using `openai/gpt-oss-120b`; rate limits may differ)
2. **Add SSE streaming** of pipeline progress (optional; polling works fine for now)
3. **Phase 5 polish:** real dashboard layout (sidebar, history of recommendations, charts of weather vs. action outcomes) + a Competitor view that calls `/api/competitor/[businessId]`
4. **Resume Phase 2:** sales ingestion (mock + DB pattern). TODO 5 (trend analysis) still deferred.
5. **Production deployment:** decide worker host (separate process on Railway/Fly.io vs. Vercel Cron + dedicated worker) — workers co-locate in dev, must be separate in prod
