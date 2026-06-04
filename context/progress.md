# Project Progress Log

> Living document. Updated as we build. Tracks dry runs, decisions, current state, and issues hit + fixes.

---

## Current State (2026-06-04)

| Phase | Status |
|---|---|
| Phase 1 — Foundation | ✅ Complete |
| Phase 2 — Data Collection | 🚧 In progress (weather worker done; sales, competitor, trends pending) |
| Phase 3 — Agent Pipeline | ⏳ Not started |
| Phase 4 — Background Jobs | 🚧 Partially done (weather cron + worker only) |
| Phase 5 — Dashboard UI | ⏳ Not started |
| Phase 6 — Polish | ⏳ Not started |

TODO 1 (Greeter agent) — **skipped** per user decision. The current `weather-agent` already validates the same patterns (Groq + tool use + streaming).

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
| `app/page.tsx` | Home — renders `<WeatherDisplay />` |
| `app/api/weather/route.ts` | `POST` → Zod-validate → `getWeatherData` → JSON |
| `instrumentation.ts` | Boot: imports worker, starts scheduler (Node only) |
| `lib/db.ts` | Prisma 7 client (uses `@prisma/adapter-pg`) |
| `lib/redis.ts` | ioredis singleton (globalThis pattern) |
| `lib/errors.ts` | `AppError` + 5 typed subclasses |
| `lib/api/handler.ts` | `apiHandler()` HOF + `errorResponse()` |
| `lib/validators/weather.ts` | Zod schema for `/api/weather` body |
| `lib/agents/weather-agent.ts` | Groq + tool use, returns `{ data } \| { error }` |
| `lib/agents/tools/weatherTool.ts` | Zod-validated tool wrapping `fetchWeather` |
| `lib/services/weather/client.ts` | Open-Meteo geocoding + forecast |
| `lib/queues/data-queue.ts` | 3 BullMQ queues |
| `lib/workers/weather-worker.ts` | Weather job processor |
| `lib/scheduler.ts` | 4 cron jobs |
| `scripts/test-worker.ts` | E2E test for the worker |

---

## Architecture Decisions (so far)

1. **Prisma 7 driver adapter** (mandatory) — `@prisma/adapter-pg`
2. **Custom error classes** for API-side error handling (no frontend error boundary)
3. **Zod schemas** in `lib/validators/<feature>.ts`
4. **`apiHandler()` HOF** wraps every route for consistent error → JSON
5. **`globalThis` pattern** on Redis client, Prisma client, worker, and scheduler to survive HMR
6. **`instrumentation.ts`** (Next.js 16 official) for boot code — runs once on server start
7. **No `datasourceUrl`** anywhere — Prisma 7 reads from adapter only
8. **Worker co-located with Next.js** in dev (single process); will need separate process in production

---

## Test Commands

```bash
# Start dev server detached (boots worker + scheduler)
Start-Process cmd.exe /c "npm run dev" -WorkingDirectory "D:\Github\AGENTIC AI\agentic-ai"

# Tail logs
Get-Content "D:\Github\AGENTIC AI\agentic-ai\dev.log" -Wait

# Test API (LLM path)
curl -X POST http://localhost:3000/api/weather -H "content-type: application/json" -d '{"city":"London"}'

# Test worker (queue path)
npx tsx scripts/test-worker.ts

# Check Redis queue
docker exec agentic-ai-redis-1 redis-cli LLEN bull:data-collect:completed
docker exec agentic-ai-redis-1 redis-cli LLEN bull:data-collect:waiting
```

---

## Next Steps

1. **Cleanup:** Add `dev.log` + `dev-err.log` to `.gitignore` and untrack
2. **Phase 2:** Sales ingestion (mock data + interface), competitor scraping (Cheerio), trend analysis
3. **Phase 3:** Data Analyzer agent (first of the 4-agent pipeline)
4. **Decide:** Worker deployment target (separate process vs. serverless cron pattern)
