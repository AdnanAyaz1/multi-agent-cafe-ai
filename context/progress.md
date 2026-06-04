# Project Progress Log

> Living document. Updated as we build. Tracks dry runs, decisions, current state, and issues hit + fixes.

---

## Current State (2026-06-04)

| Phase | Status |
|---|---|
| Phase 1 — Foundation | ✅ Complete |
| Phase 2 — Data Collection | 🚧 In progress (weather done; sales, scraping deferred per user) |
| Phase 3 — Agent Pipeline | ✅ Complete (5-agent weather flow end-to-end) |
| Phase 4 — Background Jobs | ✅ Complete for weather + analysis queues |
| Phase 5 — Dashboard UI | 🚧 Minimal (Analysis panel + Weather panel only) |
| Phase 6 — Polish | ⏳ Not started |

TODO 1 (Greeter agent) — **skipped** per user decision. TODO 4 (competitor scraping) and TODO 5 (trend analysis) — **deferred** per user decision; will revisit after the weather agentic flow is validated in production.

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

### 1. Prisma 7 — `datasourceUrl` no longer valid
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
| `instrumentation.ts` | Boot: imports both workers, starts scheduler (Node only) |
| `lib/db.ts` | Prisma 7 client (uses `@prisma/adapter-pg`) |
| `lib/redis.ts` | ioredis singleton (globalThis pattern) |
| `lib/logger.ts` | Structured logger with `child(scope)` |
| `lib/errors.ts` | `AppError` + 5 typed subclasses |
| `lib/validators/weather.ts` | Zod schema for `/api/weather` body |
| `lib/validators/analysis.ts` | Zod schemas for `/api/analysis/run` body + pipelineId |
| `lib/agents/weather-agent.ts` | Path A — Groq + weather tool, returns `{ data } \| { error }` |
| `lib/agents/tools/weatherTool.ts` | Zod-validated tool wrapping `fetchWeather` |
| `lib/agents/types.ts` | Zod schemas for every pipeline agent output |
| `lib/agents/prompts.ts` | Centralized system prompts + prompt builders |
| `lib/agents/models.ts` | Per-agent model picker (env-overridable) |
| `lib/agents/run.ts` | `withAgentRun()` — wraps `generateObject` with AgentRun DB logging + retries |
| `lib/agents/menu-analyst.ts` | Pipeline agent 1 |
| `lib/agents/weather-analyst.ts` | Pipeline agent 2 |
| `lib/agents/strategist.ts` | Pipeline agent 3 (accepts critic feedback for revisions) |
| `lib/agents/critic.ts` | Pipeline agent 4 (+ `criticHasBlockers/Warnings`) |
| `lib/agents/synthesizer.ts` | Pipeline agent 5 (+ `deriveFinalConfidence`) |
| `lib/agents/orchestrator.ts` | The 5-agent state machine + revision loop + persistence |
| `lib/services/weather/client.ts` | Open-Meteo geocoding + forecast |
| `lib/queues/data-queue.ts` | 3 BullMQ queues (`data-collect`, `ai-analysis`, `reports`) |
| `lib/workers/weather-worker.ts` | Weather job processor |
| `lib/workers/analysis-worker.ts` | AI pipeline processor (concurrency 2, rate-limited) |
| `lib/scheduler.ts` | Cron jobs: `weather-fetch` (6am), `sales-pull` (7am, stub), `daily-analysis` (9am) |
| `lib/menu/*` | Menu source (JSON), cache, types |
| `hooks/useWeather.ts` | Path A client hook |
| `hooks/useAnalysis.ts` | Path C client hook (run + poll + cancel) |
| `components/dashboard/WeatherDisplay.tsx` | Path A UI |
| `components/dashboard/AnalysisPanel.tsx` | Path C UI (button + timeline + briefing) |
| `scripts/test-worker.ts` | E2E test for the weather worker |
| `scripts/test-pipeline.ts` | E2E test for the full agent pipeline |

---

## Architecture Decisions (so far)

1. **Prisma 7 driver adapter** (mandatory) — `@prisma/adapter-pg`
2. **Custom error classes** for API-side error handling (no frontend error boundary)
3. **Zod schemas** in `lib/validators/<feature>.ts`
4. **Inline try/catch in routes** — the old `apiHandler()` HOF was removed because Next.js 16's `RouteContext<'/path'>` doesn't play with a generic wrapper (see `flow-walkthrough.md` step 4 explainer)
5. **`globalThis` pattern** on Redis client, Prisma client, both workers, and scheduler to survive HMR
6. **`instrumentation.ts`** (Next.js 16 official) for boot code — runs once on server start, registers both workers
7. **No `datasourceUrl`** anywhere — Prisma 7 reads from adapter only
8. **Workers co-located with Next.js** in dev (single process); will need separate process in production
9. **`generateObject` with Zod schemas** for every pipeline agent — typed outputs, no string parsing
10. **`AgentRun` per LLM call** (not per pipeline) — granular timing, independent failures, revision-loop visibility
11. **HTTP 202 + polling** for pipeline status — survives load balancers, no SSE state to manage
12. **`pipelineId` UUID** generated server-side, stored in `Recommendation.dataAnalysis.pipelineId` for back-lookup
13. **Bounded critic revisions** (`MAX_REVISIONS` env, default 1) — prevents ping-pong between Strategist and Critic

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

# Check Redis queues
docker exec agentic-ai-redis-1 redis-cli LLEN bull:data-collect:completed
docker exec agentic-ai-redis-1 redis-cli LLEN bull:ai-analysis:completed
docker exec agentic-ai-redis-1 redis-cli LLEN bull:ai-analysis:failed
```

---

## Next Steps

1. **Validate Path C in production-like run** — confirm Groq free-tier rate limits hold under back-to-back pipelines
2. **Add SSE streaming** of pipeline progress (optional; polling works fine for now)
3. **Phase 5 polish:** real dashboard layout (sidebar, history of recommendations, charts of weather vs. action outcomes)
4. **Resume Phase 2:** sales ingestion (mock + DB pattern), then competitor scraping (Cheerio) when needed
5. **Production deployment:** decide worker host (separate process on Railway/Fly.io vs. Vercel Cron + dedicated worker)
