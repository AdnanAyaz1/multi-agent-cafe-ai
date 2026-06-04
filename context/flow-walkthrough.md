# End-to-End Flow Walkthrough

> My personal reference. Traces every request from the browser to the database and back, with BullMQ syntax explained.

---

## Two Parallel Flows

The app has **three data paths** that share code at the `lib/services/weather` and `lib/menu` layers:

| Path | Trigger | Purpose | BullMQ? |
|---|---|---|---|
| **A — On-demand (LLM)** | User clicks "Get Weather" in the browser | Returns weather to UI **right now** | No |
| **B — Background (queue)** | Cron fires at 6am (or a job is enqueued) | Saves weather snapshot to DB for later AI analysis | **Yes** |
| **C — Agent Pipeline** | User clicks "Run Analysis" OR cron fires at 9am | Runs the 5-agent reasoning chain and saves a Recommendation | **Yes** |

All three end up calling shared building blocks — they just differ in **what's around it**.

---

## PATH A — On-Demand (Browser → LLM → Open-Meteo → Browser)

### Step 1: User opens the app
**File:** `app/page.tsx`
```tsx
import WeatherDisplay from '@/components/dashboard/WeatherDisplay';
export default function Home() {
  return <div className="min-h-screen bg-gray-100 py-8"><WeatherDisplay /></div>;
}
```
- This is a **Server Component** (no `'use client'`).
- Next.js renders it on the server, then ships the HTML + JS bundle to the browser.
- `<WeatherDisplay />` is a Client Component (it has `'use client'` at the top).

### Step 2: User types a city and clicks "Get Weather"
**File:** `components/dashboard/WeatherDisplay.tsx`
```tsx
'use client';
import { useState } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { WeatherCard } from './WeatherCard';

export default function WeatherDisplay() {
  const [city, setCity] = useState('');
  const { weather, loading, error, fetch: fetchWeather } = useWeather();

  const handleSubmit = () => {
    if (city.trim()) fetchWeather(city.trim());
  };

  return (
    <div>
      <input value={city} onChange={(e) => setCity(e.target.value)} />
      <button onClick={handleSubmit} disabled={loading || !city.trim()}>
        {loading ? 'Loading...' : 'Get Weather'}
      </button>
      {error && <div>{error}</div>}
      {weather && <WeatherCard data={weather} />}
    </div>
  );
}
```
- The component is **thin** — all logic lives in the `useWeather` hook (per `coding-practices.md` rule §3).
- The component just renders JSX and forwards clicks.
- `useState` here is **UI state** (the input field value). Data state lives in the hook.

### Step 3: The hook calls our API
**File:** `hooks/useWeather.ts`
```ts
'use client';
import { useState } from 'react';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async (city: string) => {
    setLoading(true);
    setError(null);
    setWeather(null);
    try {
      const res = await fetchWeatherApi(city);
      if (res.error) setError(res.error);
      else setWeather(res.data ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return { weather, loading, error, fetch };
}

async function fetchWeatherApi(city: string): Promise<WeatherResult> {
  const res = await fetch('/api/weather', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city }),
  });
  return res.json();
}
```
- The hook owns **all state** (loading, error, data).
- The browser's `fetch` API sends an HTTP `POST` to `/api/weather` with `{"city":"London"}` as JSON.
- This goes over the network to `localhost:3000/api/weather`.

### Step 4: Next.js API route handles the request
**File:** `app/api/weather/route.ts`
```ts
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getWeatherData } from '@/lib/agents/weather-agent';
import { weatherRequestSchema } from '@/lib/validators/weather';
import { AgentError, AppError, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    const { city } = weatherRequestSchema.parse(body);

    const result = await getWeatherData(city);

    if (result.error) {
      throw new AgentError(result.error);
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
        { status: error.statusCode }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    console.error('Unhandled API error:', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message, code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
```

#### Why no `apiHandler` wrapper anymore?

**The old setup (dukaan analogy):** We used to have a function in `lib/api/handler.ts` called `apiHandler` that wrapped every route. Think of it as a **chowkidar (gate guard)** at the dukaan's back door. Every package leaving the shop went through him — if a package was actually a bomb (a thrown error), the chowkidar quietly swapped it for a polite "sorry, try again" note (a JSON error response). The shopkeeper never had to worry about bombs.

**Why we fired the chowkidar:** Next.js 16 added a typed `params` helper called `RouteContext<'/api/menu/[businessId]'>`. It tells TypeScript exactly which URL params each route gets. Our old `apiHandler` was written **generically** — it used `Record<string, unknown>` for the context — so the chowkidar didn't know what kind of package was coming through. TypeScript started complaining:

```
error TS2339: Property 'businessId' does not exist on type 'unknown'.
```

**The fix:** Removed `lib/api/handler.ts` entirely. Each route now has its own small try/catch at the top — the same logic the chowkidar used to run, just **inside** each route door instead of outside. Same JSON output, no type fight.

**3-line summary:**
1. `apiHandler` was a wrapper that caught errors and turned them into JSON — convenient but generic.
2. Next.js 16's typed `RouteContext` clashed with that generic wrapper — TypeScript couldn't infer `params`.
3. We deleted the wrapper and inlined the same try/catch in each route. **2 routes affected:** `app/api/weather/route.ts` and `app/api/menu/[businessId]/route.ts`.

---

**What `weatherRequestSchema` does** — Zod validates the body. **File:** `lib/validators/weather.ts`
```ts
export const weatherRequestSchema = z.object({
  city: z
    .string({ message: 'City is required' })
    .min(1, 'City cannot be empty')
    .max(100, 'City name is too long')
    .trim(),
});
```
- `.parse(body)` throws a `ZodError` if invalid (caught by the route's own try/catch → 400 response).
- On success, returns a typed `{ city: string }`.

### Step 5: The agent calls the LLM
**File:** `lib/agents/weather-agent.ts`
```ts
import { generateText, stepCountIs } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { weatherTool } from '@/lib/agents/tools/weatherTool';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function getWeatherData(city: string): Promise<WeatherResult> {
  const model = process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant';

  const result = await generateText({
    model: groq(model),                   // pick the model
    tools: { weather: weatherTool },      // give it one tool
    toolChoice: 'required',               // must use the tool
    prompt: `Get the current weather for ${city}.`,
    stopWhen: stepCountIs(2),             // allow up to 2 reasoning steps
  });

  const step = result.steps.at(-1);
  const toolResult = step?.staticToolResults?.[0];

  if (!toolResult) return { error: 'No weather data received' };
  const output = toolResult.output as WeatherData & { error?: string };
  if ('error' in output) return { error: output.error };

  return { data: output };
}
```

**What happens inside `generateText`:**
1. SDK sends a request to `https://api.groq.com/openai/v1/chat/completions` with:
   - The prompt
   - The list of available tools (descriptions + JSON schemas)
   - `tool_choice: "required"` forces the model to call one
2. Groq's LLM thinks, then returns a tool call: `{"name": "weather", "arguments": {"city": "London"}}`.
3. The SDK sees the tool call, looks up `weather` in our `tools` object, and runs `weatherTool.execute({ city: "London" })`.
4. The tool returns data. The SDK feeds that back to the LLM.
5. The LLM responds with the final text. SDK returns the full result.

**`stepCountIs(2)`:** This is a "stop condition". It tells the SDK: "let the loop run for up to 2 model-call iterations". Since we just want a tool call + final answer, 2 is plenty. The default is `stepCountIs(1)`, which would stop too early (after the tool call but before the LLM sees the result).

### Step 6: The tool runs and calls Open-Meteo
**File:** `lib/agents/tools/weatherTool.ts`
```ts
import { tool } from 'ai';
import { z } from 'zod';
import { fetchWeather } from '@/lib/services/weather/client';

export const weatherTool = tool({
  description: 'Get current weather for a city. Use whenever the user asks about weather...',
  inputSchema: z.object({ city: z.string().describe('City name, e.g. "London"') }),
  execute: async ({ city }) => {
    try {
      return await fetchWeather(city);
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to fetch weather' };
    }
  },
});
```
- The `description` and `inputSchema` are sent to the LLM so it knows **when** and **how** to call this tool.
- `execute` runs when the LLM decides to call it.
- We catch errors and return `{ error: '...' }` as data, so the LLM can decide what to do (vs. throwing and aborting the whole run).

**File:** `lib/services/weather/client.ts`
```ts
const GEO_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast';

async function geocode(city: string): Promise<GeoResult | null> {
  const res = await fetch(`${GEO_BASE}?name=${encodeURIComponent(city)}&count=1&language=en`);
  if (!res.ok) return null;
  const body = await res.json();
  return body.results?.[0] ?? null;
}

export async function fetchWeather(city: string): Promise<WeatherData> {
  const geo = await geocode(city);
  if (!geo) throw new Error(`City "${city}" not found`);

  const res = await fetch(`${FORECAST_BASE}?latitude=${geo.latitude}&longitude=${geo.longitude}` +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m');
  // ... return normalized WeatherData
}
```
- Two HTTP calls to Open-Meteo:
  1. **Geocoding** — converts "London" → `{lat: 51.5, lon: -0.13, country: "GB"}`
  2. **Forecast** — gets the current weather at those coordinates
- Result is normalized into our `WeatherData` shape (see `lib/types.ts`).

### Step 7: Response bubbles back up
- `weatherTool.execute` returns `WeatherData` to the SDK
- SDK feeds it to the LLM
- LLM responds (we don't even use the LLM's text — we read the raw tool result from `result.steps.at(-1).staticToolResults[0]`)
- Agent returns `{ data: WeatherData }` to the route
- Route returns `NextResponse.json(result)` (200 OK) — no wrapper, just the route's own return

### Step 8: Browser renders
- `useWeather.fetch` receives the JSON
- `setWeather(res.data)` updates state
- React re-renders → `<WeatherCard data={weather} />` appears

### Full ASCII diagram — Path A
```
Browser                   Next.js                      Groq              Open-Meteo
  │                          │                          │                    │
  │  POST /api/weather       │                          │                    │
  │  {city:"London"}         │                          │                    │
  ├─────────────────────────►│                          │                    │
  │                          │ weatherRequestSchema     │                    │
  │                          │   .parse() ✅             │                    │
  │                          │                          │                    │
  │                          │ generateText({...})      │                    │
  │                          ├─────────────────────────►│                    │
  │                          │                          │ LLM decides to     │
  │                          │                          │ call "weather"     │
  │                          │                          │ tool with city     │
  │                          │◄─────────────────────────┤                    │
  │                          │                          │                    │
  │                          │ weatherTool.execute()    │                    │
  │                          │   fetchWeather("London") │                    │
  │                          ├──────────────────────────────────────────────►│
  │                          │                          │     1. geocode     │
  │                          │                          │     2. forecast    │
  │                          │◄──────────────────────────────────────────────┤
  │                          │ WeatherData              │                    │
  │                          │                          │                    │
  │                          │ feed result back to LLM  │                    │
  │                          ├─────────────────────────►│                    │
  │                          │◄─────────────────────────┤                    │
  │                          │ final response           │                    │
  │                          │                          │                    │
  │  200 { data: {...} }     │                          │                    │
  │◄─────────────────────────┤                          │                    │
  │                          │                          │                    │
  │ setState → <WeatherCard/>│                          │                    │
```

---

## PATH B — Background (Cron → BullMQ → Worker → DB)

This is the path that uses **BullMQ** and runs without a user.

### Step 1: Server starts, `instrumentation.ts` fires
**File:** `instrumentation.ts` (at project root, not in `app/`)
```ts
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('@/lib/workers/weather-worker');  // side effect: creates Worker
    const { startScheduler } = await import('@/lib/scheduler');
    startScheduler();
    console.log('[boot] workers and scheduler initialized');
  }
}
```
- Next.js calls `register()` **once** on server startup, before accepting requests.
- The `NEXT_RUNTIME` check ensures this doesn't run on Edge runtime (workers can't run there).
- **Dynamic imports** (not top-level) keep the boot code isolated — the docs recommend this.

### Step 2: Worker is created (side effect of import)
**File:** `lib/workers/weather-worker.ts`
```ts
import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/db';
import { fetchWeather } from '@/lib/services/weather/client';

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
};

const globalForWorker = globalThis as unknown as { weatherWorker: Worker<WeatherJobData> | undefined };

function createWorker(): Worker<WeatherJobData> {
  return new Worker<WeatherJobData>(
    'data-collect',                            // ← queue name to subscribe to
    async (job: Job<WeatherJobData>) => {      // ← processor function
      const { businessId, city } = job.data;
      job.log(`Fetching weather for ${city}...`);

      const weather = await fetchWeather(city);
      await prisma.dataSnapshot.create({
        data: { businessId, source: 'weather', data: weather, expiresAt: new Date(Date.now() + 86_400_000) },
      });

      return { success: true, city, temperature: weather.temperature };
    },
    {
      connection,                              // ← must match the queue's connection
      limiter: { max: 10, duration: 60_000 },  // ← max 10 jobs per minute
    }
  );
}

export const weatherWorker = globalForWorker.weatherWorker ?? createWorker();
if (process.env.NODE_ENV !== 'production') globalForWorker.weatherWorker = weatherWorker;
```

#### BullMQ syntax deep dive

**`new Worker<TData>(name, processor, options)`**
- The **constructor** of the `Worker` class from `bullmq`.
- `TData` is a TypeScript generic for the job payload shape.
- Arguments:
  - `name` (string) — queue name to listen on. Must match the queue the producer uses.
  - `processor` (function) — async function called once per job. Receives a `Job<TData>`.
  - `options` — config object.

**`options.connection`** — the Redis connection. **Must match** the queue's connection exactly, otherwise the worker and queue are talking to different Redis "channels" and the worker will never see jobs.

**`options.limiter`** — rate limit.
- `max: 10` — at most 10 jobs
- `duration: 60_000` — within 60,000ms (1 minute)
- BullMQ enforces this: it won't even pop a new job from the queue if the limit is hit.

**`globalThis` pattern** — Next.js dev mode hot-reloads modules. Without this, every save would create a new `Worker` instance, each opening a new Redis connection and listening to the same queue. Result: 10 workers after 10 saves, all fighting for jobs. Stashing the worker on `globalThis` keeps one instance for the lifetime of the Node process.

**`Job<TData>`** — what the processor function receives.
- `job.data` — the payload you `add()`'d on the producer side. Typed as `TData`.
- `job.id` — unique job ID (string).
- `job.log(message)` — appends a log line, visible in BullMQ Board UI.
- `job.attemptsMade` — how many retries have happened.
- `job.returnvalue` — the resolved value (what the processor returned).
- `job.progress(value)` — for progress tracking (0-100 or any object).

**The processor's return value** — Whatever you `return` from the processor is stored in Redis under the job's `returnvalue` field for 7 days. You can fetch it later via `job.returnvalue` (synchronously) or use it for debugging.

**Worker event listeners:**
```ts
weatherWorker.on('completed', (job) => console.log(`Job ${job.id} done`));
weatherWorker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err.message));
```
- `'completed'` — fires after a successful processor return.
- `'failed'` — fires after a job exhausts all retries.
- Other events: `'progress'`, `'error'`, `'stalled'`, `'ready'`, `'closed'`.

### Step 3: Scheduler registers 4 cron jobs
**File:** `lib/scheduler.ts`
```ts
import cron from 'node-cron';
import { dataCollectQueue, aiAnalysisQueue } from './queues/data-queue';
import { prisma } from './db';

const jobs: ScheduledJob[] = [
  {
    name: 'weather-fetch',
    cron: process.env.WEATHER_FETCH_CRON ?? '0 6 * * *',
    run: async () => {
      const businesses = await prisma.business.findMany();
      for (const biz of businesses) {
        await dataCollectQueue.add(
          'weather-fetch',                   // ← job name (within the queue)
          { businessId: biz.id, city: biz.city, latitude: biz.latitude ?? undefined, longitude: biz.longitude ?? undefined },
          { priority: 1 }                    // ← job options
        );
      }
    },
  },
  // ... 3 more
];

export function startScheduler() {
  if (globalForScheduler.schedulerStarted) return;
  globalForScheduler.schedulerStarted = true;

  for (const job of jobs) {
    cron.schedule(job.cron, async () => {
      try { await job.run(); }
      catch (e) { console.error(`[scheduler] ${job.name} crashed:`, e); }
    });
  }
}
```

#### `node-cron` syntax

**`cron.schedule(expression, callback)`** — runs `callback` on a schedule.
- `expression` is a 5-field cron string: `minute hour day month weekday`
- `'0 6 * * *'` = at 06:00 every day
- `'*/15 * * * *'` = every 15 minutes
- `'0 9 * * 1-5'` = at 09:00 on weekdays only

**Why `node-cron` and not BullMQ's repeat jobs?**
- `node-cron` runs **in the same process** — simpler to reason about, no extra Redis calls.
- BullMQ's `repeat: { pattern: '...' }` is more powerful (persisted, survives restarts) but adds complexity.
- For our use case (triggering jobs that then enqueue BullMQ work), `node-cron` is fine.

#### BullMQ producer syntax — `queue.add(name, data, options)`

```ts
await dataCollectQueue.add(
  'weather-fetch',                          // job name (string, used in events)
  { businessId: biz.id, city: biz.city },   // payload — typed as JobData
  { priority: 1 }                           // optional: per-job options
);
```

| Argument | Required | Description |
|---|---|---|
| `name` | yes | Identifies the job type. Used in events, BullMQ Board, logs. |
| `data` | yes | The payload. Anything JSON-serializable. We type it as `WeatherJobData` etc. |
| `options` | no | Per-job override. Falls back to `defaultJobOptions` from the queue. |

**Common per-job options:**
- `priority: number` — lower = higher priority. Default: `5`. BullMQ's docs say "lower numbers have higher priority".
- `delay: number` — ms to wait before the job is processable. Useful for "send this email in 1 hour".
- `attempts: number` — overrides the queue's default retry count.
- `backoff` — overrides the queue's default backoff.
- `removeOnComplete: number \| boolean` — how many completed jobs to keep (for history).
- `removeOnFail: number \| boolean` — how many failed jobs to keep.

**What `add()` does internally:**
1. Creates a job ID (`bull:data-collect:id` is incremented)
2. Serializes the job (data + options) → stores as a hash at `bull:data-collect:<jobId>`
3. `LPUSH bull:data-collect:wait <jobId>` — adds it to the wait list
4. Returns a `Job` instance

### Step 4: Worker picks up the job (internals)

BullMQ uses Redis lists and a pub/sub-style mechanism. When a job is enqueued:

```
Redis state after queue.add('weather-fetch', { city: 'London' }):

  bull:data-collect:wait       = [ "job-id-123" ]          (FIFO list)
  bull:data-collect:job-id-123 = { name, data, opts, ... } (hash)
  bull:data-collect:id        = "job-id-123"              (auto-increment)
  bull:data-collect:events    = [ "added:job-id-123" ]     (event log)
```

The worker is **subscribed** to the queue via `BRPOPLPUSH bull:data-collect:wait bull:data-collect:active` (atomic move, blocking).
- `BRPOPLPUSH` blocks the worker until something is in `wait`, then atomically moves it to `active`.
- This means **the worker spends zero CPU** when idle — it just waits on a Redis blocking command.

When a job arrives:
```
  bull:data-collect:wait       = []
  bull:data-collect:active     = [ "job-id-123" ]
  bull:data-collect:job-id-123 = { ... }  (still there)
```

The worker runs the processor. On success:
```
  bull:data-collect:active     = []
  bull:data-collect:completed  = [ "job-id-123" ]    (kept for 7 days by default)
```

On failure (and `attempts` not exhausted):
```
  bull:data-collect:active     = []
  bull:data-collect:wait       = [ "job-id-123" ]    (back to wait, with delay)
  bull:data-collect:job-id-123.attempts = 1
```

On final failure (attempts exhausted):
```
  bull:data-collect:failed     = [ "job-id-123" ]
  bull:data-collect:events     = [ "...:failed" ]
  → worker.on('failed') listener fires
```

### Step 5: Test what we built

**File:** `scripts/test-worker.ts`
```ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Queue } from 'bullmq';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const queue = new Queue('data-collect', {
  connection: { host: process.env.REDIS_HOST!, port: parseInt(process.env.REDIS_PORT!, 10) },
});

const biz = await prisma.business.upsert({ where: { id: 'test-biz-1' }, ... });
const job = await queue.add('weather-fetch', { businessId: 'test-biz-1', city: 'Tokyo' });
await job.waitUntilFinished(queue, 30000);
console.log(await job.returnvalue);
```

**`job.waitUntilFinished(queue, timeoutMs)`** — blocks until the job is processed by ANY worker. Returns the job's result. Throws on failure or timeout.
- Note: in our test, this timed out (30s) even though the worker completed the job in ~5s. Why? Because `waitUntilFinished` uses a **separate Redis connection** to subscribe to job events. The worker's `completed` event fires on the worker's connection, and the test script's subscription may not have been set up at the time. The job **did** complete — `dev.log` showed `[weather-worker] job 1 completed for Tokyo`. This is a known quirk when producer and worker are in different processes.

### Full ASCII diagram — Path B
```
                                  Next.js process                          
  ┌────────────────────────────────────────────────────────────────────┐
  │                                                                     │
  │  instrumentation.ts:register()  (once on startup)                   │
  │       │                                                             │
  │       ├─ import '@/lib/workers/weather-worker'                       │
  │       │      │                                                      │
  │       │      └─► new Worker('data-collect', processor, opts)        │
  │       │            └─► subscribes to Redis on 'bull:data-collect'   │
  │       │                                                             │
  │       └─ startScheduler()                                           │
  │              │                                                      │
  │              └─► cron.schedule('0 6 * * *', async () => {           │
  │                     const bizs = await prisma.business.findMany();  │
  │                     for (const b of bizs) {                         │
  │                       await dataCollectQueue.add(                   │
  │                         'weather-fetch',                            │
  │                         { businessId: b.id, city: b.city }          │
  │                       );                                            │
  │                     }                                                │
  │                  })                                                  │
  │                                                                     │
  │  ... (time passes, or test script runs) ...                         │
  │                                                                     │
  │  ─── 6am, cron fires (or: queue.add() from anywhere) ───            │
  │                                                                     │
  │       ┌─────────── Redis ───────────┐                               │
  │       │  LPUSH bull:data-collect:wait│  ◄─ job enqueued              │
  │       │  <jobId>                    │                               │
  │       └─────────────────────────────┘                               │
  │                │                                                    │
  │                ▼ (BRPOPLPUSH)                                       │
  │       ┌─────────── Redis ───────────┐                               │
  │       │  LPUSH bull:data-collect:active│                            │
  │       │  LREM  bull:data-collect:wait│                               │
  │       └─────────────────────────────┘                               │
  │                                                                     │
  │  Worker processor runs:                                             │
  │    const { businessId, city } = job.data;                           │
  │    const weather = await fetchWeather(city);  ──────► Open-Meteo    │
  │    await prisma.dataSnapshot.create({ ... });  ─────► Postgres       │
  │    return { success: true, city, temperature };                     │
  │                                                                     │
  │       ┌─────────── Redis ───────────┐                               │
  │       │  LPUSH bull:data-collect:completed│                         │
  │       │  LREM  bull:data-collect:active│                            │
  │       └─────────────────────────────┘                               │
  │                                                                     │
  │  worker.on('completed', job => console.log(`job ${job.id} done`))   │
  │                                                                     │
  └────────────────────────────────────────────────────────────────────┘
```

---

## PATH C — Agent Pipeline (Browser → BullMQ → 5 Agents → DB → Polling UI)

This is where the **agentic AI** part of the app actually lives. A user clicks "Run Analysis" (or the 9am cron fires) and a chain of five LLM agents reasons over the weather snapshot + the cafe menu and produces an owner-facing daily briefing.

### Mental model first — the dukaan analogy

Imagine the cafe owner has **five consultants on a WhatsApp group**:

1. **Menu Analyst** — knows every dish, classifies what's hot, cold, premium, signature.
2. **Weather Analyst** — looks outside, says "it's going to rain at 3pm, expect cold-drink sales to drop."
3. **Strategist** — reads both notes, says "today: push Karak Chai, discount Iced Latte 15%, hold the rest."
4. **Critic** — re-reads the Strategist's plan, says "you can't discount the Iced Latte AND Cold Coffee on the same day — pick one."
5. **Synthesizer** — takes the final plan + critic notes and writes the WhatsApp message the owner actually reads.

The orchestrator (`lib/agents/orchestrator.ts`) is the **group admin** who pings each consultant in order, collects replies, and posts the final summary to the owner.

### Step 1: User clicks "Run Analysis"
**File:** `components/dashboard/AnalysisPanel.tsx`

The component is thin (per coding-practices.md §3). It owns no logic — it calls the `useAnalysis()` hook.

```tsx
'use client';
const { run, status, loading, error } = useAnalysis();
// ... <button onClick={() => run(businessId)}>Run Analysis</button>
```

### Step 2: Hook posts to `/api/analysis/run`
**File:** `hooks/useAnalysis.ts`

```ts
const res = await fetch('/api/analysis/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ businessId }),
});
const { pipelineId } = await res.json();
startPolling(pipelineId);   // ← polls /api/analysis/[pipelineId] every 1.5s
```

The hook then polls the status endpoint every **1.5 seconds** until the pipeline reaches `complete` or `failed` (or hits the 5-minute timeout). No SSE / WebSocket — polling is simpler and works behind every proxy and CDN.

### Step 3: API route enqueues the job (does NOT run agents)
**File:** `app/api/analysis/run/route.ts`

```ts
const { businessId } = analysisRunRequestSchema.parse(body);
// 1. Confirm the business exists (404 if not)
await prisma.business.findUnique({ where: { id: businessId } });
// 2. Generate a UUID for this pipeline cycle
const pipelineId = randomUUID();
// 3. Push a job onto the ai-analysis queue and return immediately (202 Accepted)
await aiAnalysisQueue.add('full-pipeline', { businessId, pipelineId }, { priority: 2 });
return NextResponse.json({ pipelineId, statusUrl: `/api/analysis/${pipelineId}` }, { status: 202 });
```

**Why 202, not 200?** HTTP 202 means "I accepted your request and will process it asynchronously." The client should poll the `statusUrl` to find out what happened. 200 would imply "done, here's your answer" — but the real answer takes ~10-30s of LLM time.

**Why a UUID, not the BullMQ job ID?** BullMQ job IDs are incrementing numbers per queue. A UUID is globally unique, easy to look up in the DB, and survives BullMQ restarts. The `pipelineId` is the **business-level identifier** for one analysis cycle.

### Step 4: Analysis worker picks up the job
**File:** `lib/workers/analysis-worker.ts`

```ts
export const analysisWorker = new Worker<AnalysisJobData>(
  'ai-analysis',
  async (job) => {
    const { businessId, pipelineId } = job.data;
    return await runAnalysisPipeline({ businessId, pipelineId });
  },
  {
    connection,
    concurrency: 2,                              // up to 2 pipelines in parallel
    limiter: { max: 8, duration: 60_000 },       // respect Groq rate limits
  }
);
```

This worker lives in the **same Node process** as the dev server (via `instrumentation.ts`). In production, you'd run it in a separate process — see `progress.md` issue #2.

The worker just delegates to `runAnalysisPipeline()`. Everything interesting happens in the orchestrator.

### Step 5: Orchestrator runs the 5 agents
**File:** `lib/agents/orchestrator.ts`

```ts
export async function runAnalysisPipeline(context: PipelineContext) {
  // 1. Load the inputs: latest weather snapshot + menu
  const { weather, menu } = await loadInputs(context);

  // 2. Menu + Weather Analysts run in PARALLEL (they don't depend on each other)
  const [menuAnalysis, weatherAnalysis] = await Promise.all([
    runMenuAnalyst({ menu }, context).then((r) => r.output),
    runWeatherAnalyst({ weather }, context).then((r) => r.output),
  ]);

  // 3. Strategist proposes actions
  let strategist = (await runStrategist({ menuAnalysis, weatherAnalysis, rawMenu: menu, revision: 0 }, context)).output;

  // 4. Critic reviews; loop back to Strategist if blockers + revisions remain
  let critic = (await runCritic({ menuAnalysis, weatherAnalysis, strategistOutput: strategist }, context)).output;
  let revisions = 0;
  while (criticHasBlockers(critic) && revisions < MAX_REVISIONS) {
    revisions += 1;
    strategist = (await runStrategist({ ..., criticFeedback: critic, revision: revisions }, context)).output;
    critic = (await runCritic({ ..., strategistOutput: strategist }, context)).output;
  }

  // 5. Synthesizer writes the final briefing
  const synthesizer = (await runSynthesizer({ menuAnalysis, weatherAnalysis, strategistOutput: strategist, criticOutput: critic }, context)).output;

  // 6. Persist Recommendation + RecommendationAction[] rows
  const recommendation = await persistRecommendation(context, { ... });

  return { pipelineId, recommendationId: recommendation.id, revisions, durationMs };
}
```

#### Why this shape?

1. **Inputs are loaded once.** Re-reading the DB per agent would be wasteful and could give different agents different snapshots.
2. **Independent agents run in parallel.** Menu and Weather Analysts don't read each other's output, so `Promise.all`. Saves ~2-3 seconds per pipeline.
3. **Critic revision loop is bounded.** `MAX_REVISIONS` (default 1) caps the loop at 2 strategist runs + 2 critic runs. Without this, a stubborn critic + a generous strategist could ping-pong forever.
4. **Strict input/output schemas.** Every agent's output is validated by Zod (`lib/agents/types.ts`). If the LLM returns garbage, `generateObject` throws and `withAgentRun` records the failure.
5. **Each agent call is a row.** `withAgentRun` writes an `AgentRun` to Postgres for every invocation (including revision rounds). The pipeline timeline is queryable by `pipelineId`.

### Step 6: `withAgentRun` — the per-agent wrapper
**File:** `lib/agents/run.ts`

This is the function that does the actual LLM call. It wraps `generateObject` with DB logging.

```ts
export async function withAgentRun<Output>(args: AgentRunArgs<Output>) {
  // 1. Insert AgentRun row (status: 'running')
  const run = await prisma.agentRun.create({
    data: { pipelineId, agentName, status: 'running', startedAt, input: inputSnapshot },
  });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // 2. Call the LLM with a Zod schema — output is fully typed
      const result = await generateObject({ model, system, prompt, schema, schemaName });

      // 3. Mark complete with duration + tokens
      await prisma.agentRun.update({
        where: { id: run.id },
        data: {
          status: 'complete',
          output: result.object,
          durationMs: Date.now() - start,
          tokenCount: result.usage?.totalTokens ?? 0,
          completedAt: new Date(),
        },
      });
      return { agentRunId: run.id, output: result.object, durationMs, tokenCount };

    } catch (e) {
      // 4. Retry with backoff
      if (attempt < maxAttempts) await sleep(800 * attempt);
    }
  }

  // 5. All attempts exhausted — mark failed and throw AgentError
  await prisma.agentRun.update({ where: { id: run.id }, data: { status: 'failed', error: lastMessage } });
  throw new AgentError(...);
}
```

**Why one DB row per agent call** (vs. one row per pipeline)? Three reasons:
1. **Granular timing.** You can see Strategist took 4s while Synthesizer took 1.2s, then optimize the slow one.
2. **Independent failure.** If only the Critic fails, you still have the other 4 agent outputs in DB.
3. **Revision visibility.** When the Critic forces a revision, you get a fresh `strategist` row for round 2 with its own input, output, and tokens — no need to overwrite the round-1 record.

### Step 7: Result is persisted
**File:** `lib/agents/orchestrator.ts` (function `persistRecommendation`)

After the Synthesizer finishes, the orchestrator writes:
- **1 `Recommendation` row** — `summary` (Synthesizer headline), `reasoning` (the markdown briefing), `confidence`, `category`, `priority`, `dataAnalysis` (menu + weather analyst outputs + `pipelineId`), `criticNotes` (full critic output).
- **N `RecommendationAction` rows** — one per Strategist action. `actionType` is `promote`/`discount`/`hold`/`remove`, `item` is the dish name, `details` carries `{ itemId, priority, reason, discountPercent }`.

The `pipelineId` lives inside `dataAnalysis.pipelineId` so the status endpoint can find this recommendation later.

### Step 8: Client polling sees `status: 'complete'`
**File:** `app/api/analysis/[pipelineId]/route.ts`

The status endpoint reads from Postgres only — no Redis, no BullMQ peeking. The source of truth is the `AgentRun` rows + the `Recommendation` row.

```ts
const runs = await prisma.agentRun.findMany({
  where: { pipelineId: validId },
  orderBy: { createdAt: 'asc' },
});
// ... derive status from run statuses (any 'failed' → failed, any 'running' → running, all 5+ 'complete' → complete)
// ... if synthesizer is complete, fetch Recommendation by dataAnalysis.pipelineId
return NextResponse.json({ pipelineId, status, agentRuns, recommendation, ... });
```

The client polls this every 1.5s. When `status === 'complete'`, polling stops, and the UI renders the briefing.

### Full ASCII diagram — Path C
```
Browser            Next.js API           Redis (BullMQ)        Worker process         Postgres        Groq
   │                   │                       │                     │                   │             │
   │  POST             │                       │                     │                   │             │
   │  /api/analysis/run│                       │                     │                   │             │
   ├──────────────────►│                       │                     │                   │             │
   │                   │ validate body         │                     │                   │             │
   │                   │ pipelineId = uuid()   │                     │                   │             │
   │                   │ aiAnalysisQueue.add() │                     │                   │             │
   │                   ├──────────────────────►│                     │                   │             │
   │  202              │                       │                     │                   │             │
   │  { pipelineId }   │                       │                     │                   │             │
   │◄──────────────────┤                       │                     │                   │             │
   │                   │                       │ BRPOPLPUSH wakes... │                   │             │
   │                   │                       ├────────────────────►│                   │             │
   │                   │                       │                     │ load weather snap │             │
   │                   │                       │                     ├──────────────────►│             │
   │                   │                       │                     │ load menu (JSON)  │             │
   │                   │                       │                     │                   │             │
   │                   │                       │                     │ ┌─ Promise.all ─┐ │             │
   │                   │                       │                     │ │  Menu Analyst │ │             │
   │                   │                       │                     │ │  Weather An.  │ │             │
   │                   │                       │                     │ └───┬───────┬───┘ │             │
   │                   │                       │                     ├─────│───────│─────────────────►│
   │                   │                       │                     │     │       │     │ generateObj │
   │                   │                       │                     │◄────┴───────┴────────────────  │
   │                   │                       │                     │ INSERT agent_run x2             │
   │                   │                       │                     ├──────────────────►│             │
   │                   │                       │                     │                   │             │
   │                   │                       │                     │ Strategist ──────────────────►│
   │                   │                       │                     │◄─────────────────────────────  │
   │                   │                       │                     │ INSERT agent_run                │
   │                   │                       │                     ├──────────────────►│             │
   │                   │                       │                     │                   │             │
   │  GET /api/analysis│                       │                     │                   │             │
   │  /[pipelineId]    │                       │                     │                   │             │
   ├──────────────────►│                       │                     │                   │             │
   │                   │ SELECT agent_run ─────────────────────────────────────────────►│             │
   │                   │◄─────────────────────────────────────────────────────────────  │             │
   │  200 (running)    │                       │                     │                   │             │
   │◄──────────────────┤                       │                     │                   │             │
   │  (poll again 1.5s)│                       │                     │                   │             │
   │                   │                       │                     │                   │             │
   │                   │                       │                     │ Critic ──────────────────────►│
   │                   │                       │                     │◄─────────────────────────────  │
   │                   │                       │                     │  (if blockers) loop strategist  │
   │                   │                       │                     │                   │             │
   │                   │                       │                     │ Synthesizer ─────────────────►│
   │                   │                       │                     │◄─────────────────────────────  │
   │                   │                       │                     │                   │             │
   │                   │                       │                     │ INSERT Recommendation +         │
   │                   │                       │                     │ RecommendationAction[] ────────►│
   │                   │                       │                     │                   │             │
   │  GET status       │                       │                     │                   │             │
   ├──────────────────►│ SELECT agent_run, Recommendation────────────────────────────────►│             │
   │  200 (complete)   │                       │                     │                   │             │
   │  + briefing       │                       │                     │                   │             │
   │◄──────────────────┤                       │                     │                   │             │
```

---

## Production-grade touches in Path C

| Concern | How it's handled |
|---|---|
| **Typed agent I/O** | Every agent uses `generateObject({ schema })` with a Zod schema. No string parsing. |
| **Per-call observability** | `AgentRun` row per LLM call: status, input snapshot, output, duration, tokens, error. |
| **Retries** | `withAgentRun({ retries: 1 })` — 2 attempts with 800ms backoff. Recorded as a single AgentRun row. |
| **Rate limiting** | Worker `limiter: { max: 8, duration: 60_000 }` keeps Groq free-tier safe. |
| **Concurrency** | `ANALYSIS_CONCURRENCY=2` lets two pipelines process in parallel (different businesses). |
| **Bounded revision loop** | `MAX_REVISIONS` env var (default 1) caps Strategist ↔ Critic ping-pong. |
| **Idempotency / dedup** | Every request gets a fresh UUID. If the user clicks twice, two pipelines run independently. |
| **Failure isolation** | Each agent is wrapped — one failure marks its `AgentRun` as `failed` and bubbles up. Earlier agents' outputs are preserved in DB. |
| **No agent secrets in client** | All agent files import `'server-only'` or are server-only by location (`lib/`, `app/api/`). |
| **Polling, not SSE** | Status endpoint reads from DB. No connection state held server-side — survives restarts and load balancers. |
| **Centralized prompts** | All system prompts live in `lib/agents/prompts.ts`. Easy to iterate or A/B test. |

---

## Cheat sheet — Path C files

| File | Role |
|---|---|
| `app/api/analysis/run/route.ts` | `POST` — validate body, enqueue pipeline, return `pipelineId` |
| `app/api/analysis/[pipelineId]/route.ts` | `GET` — read AgentRuns + Recommendation from DB, derive status |
| `lib/workers/analysis-worker.ts` | BullMQ Worker on `ai-analysis` queue; calls orchestrator |
| `lib/agents/orchestrator.ts` | The 5-agent state machine + revision loop + DB persistence |
| `lib/agents/run.ts` | `withAgentRun()` — wraps every LLM call with AgentRun logging + retries |
| `lib/agents/models.ts` | Per-agent model picker (env-overridable) |
| `lib/agents/prompts.ts` | All system prompts and prompt builders, in one place |
| `lib/agents/types.ts` | Zod schemas for every agent's typed output |
| `lib/agents/menu-analyst.ts` | Menu Analyst agent (1 function) |
| `lib/agents/weather-analyst.ts` | Weather Analyst agent |
| `lib/agents/strategist.ts` | Strategist agent (accepts critic feedback for revisions) |
| `lib/agents/critic.ts` | Critic agent + `criticHasBlockers/Warnings` helpers |
| `lib/agents/synthesizer.ts` | Synthesizer agent + `deriveFinalConfidence` helper |
| `lib/validators/analysis.ts` | Zod schemas for the API request body + pipelineId |
| `hooks/useAnalysis.ts` | Client hook: run + poll + cancel |
| `components/dashboard/AnalysisPanel.tsx` | Thin UI: input, button, agent timeline, briefing |
| `scripts/test-pipeline.ts` | End-to-end test (seeds business, runs weather, runs pipeline, prints result) |

---

## Run it yourself

```powershell
# 1. Make sure Redis is up
docker ps    # expect agentic-ai-redis-1

# 2. Start dev server detached (boots both workers + scheduler)
Start-Process cmd.exe /c "npm run dev" -WorkingDirectory "D:\Github\AGENTIC AI\agentic-ai"

# 3. Tail logs
Get-Content dev.log -Wait

# 4. Run the end-to-end test (seeds business, fetches weather, runs pipeline, prints briefing)
npx tsx scripts/test-pipeline.ts

# 5. Or use the UI: visit http://localhost:3000, type a city in the weather box,
#    then scroll down to "Daily AI Briefing" and click "Run Analysis".

# 6. Inspect agent runs for a pipeline
docker exec agentic-ai-redis-1 redis-cli LLEN bull:ai-analysis:completed
```

---

## Where the three paths share code

Path A and Path B both call `lib/services/weather/client.ts:fetchWeather(city)`. Path C reads the **persisted** snapshot Path B wrote — it never re-fetches.

| Layer | Path A (on-demand) | Path B (queue) | Path C (pipeline) |
|---|---|---|---|
| Entry | `app/api/weather/route.ts` | `lib/scheduler.ts` cron → `lib/workers/weather-worker.ts` | `app/api/analysis/run/route.ts` → `lib/workers/analysis-worker.ts` |
| LLM? | ✅ Yes (Groq with `weather` tool) | ❌ No (calls `fetchWeather` directly) | ✅ Yes (5 agents, `generateObject` with Zod schemas) |
| BullMQ? | ❌ No | ✅ Yes (`data-collect` queue) | ✅ Yes (`ai-analysis` queue) |
| Reads | — | Open-Meteo (live) | Latest `DataSnapshot` (weather) + `Menu` from JSON file |
| Writes | — | `DataSnapshot` row | `AgentRun` rows (5+) + `Recommendation` + `RecommendationAction[]` |
| Result | Returned to the browser | Saved for later analysis | Polled by the browser; persisted forever |

Path B feeds Path C. Without a fresh weather snapshot, Path C throws `AgentError('No fresh weather snapshot...')`.

---

## Cheat sheet — all the BullMQ types/functions we use

| What | Where | What it does |
|---|---|---|
| `new Queue(name, opts)` | `lib/queues/data-queue.ts` | Creates a producer for a named queue. |
| `queue.add(name, data, opts)` | scheduler + test script | Pushes a job onto the queue. |
| `new Worker(name, fn, opts)` | `lib/workers/weather-worker.ts` | Subscribes a consumer to a queue. |
| `Job<TData>` | processor param | The job being processed. |
| `job.data` | inside processor | The payload you added. |
| `job.log(msg)` | inside processor | Append to the job's log. |
| `worker.on('completed', cb)` | worker file | Fires after success. |
| `worker.on('failed', cb)` | worker file | Fires after retries exhausted. |
| `defaultJobOptions.attempts` | queue file | Default retry count. |
| `defaultJobOptions.backoff` | queue file | Delay strategy between retries. |
| `Worker.options.limiter` | worker file | Rate limit (max jobs per duration). |
| `Job.addOptions.priority` | `queue.add()` | Per-job priority override. |
| `Job.addOptions.delay` | `queue.add()` | Wait this many ms before the job is processable. |
| `job.waitUntilFinished(queue, ms)` | test script | Block until the job completes (or times out). |
| `job.returnvalue` | after completion | The processor's return value. |

---

## Mental model summary

- **Path A** = the LLM brain (small). Tool-calling agent that answers "what's the weather in X right now". Slow (~2-5s) because Groq is involved. User-facing.
- **Path B** = the muscle. Cron triggers, worker runs, data is saved. Fast (~500ms). Machine-facing, feeds Path C.
- **Path C** = the **agentic AI** part. Five LLM agents reason in sequence (with a critic revision loop) over the cached weather snapshot + the menu, and write a daily briefing the cafe owner reads on their phone.
- All three end up touching the same `WeatherData` shape. Path B caches it for Path C to use later.
- BullMQ makes Paths B and C reliable — a crashed server doesn't lose the work, retries are automatic, and rate limits prevent Groq throttling.
- `AgentRun` rows are the **audit log**: every LLM call is one row. Open the DB and you can replay any pipeline.
