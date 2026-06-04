# End-to-End Flow Walkthrough

> My personal reference. Traces every request from the browser to the database and back, with BullMQ syntax explained.

---

## Two Parallel Flows

The app has **two completely separate data paths** that share code at the `lib/services/weather` layer:

| Path | Trigger | Purpose | BullMQ? |
|---|---|---|---|
| **A — On-demand (LLM)** | User clicks "Get Weather" in the browser | Returns weather to UI **right now** | No |
| **B — Background (queue)** | Cron fires at 6am (or a job is enqueued) | Saves weather snapshot to DB for later AI analysis | **Yes** |

Both paths end up calling the same `fetchWeather(city)` function — they just differ in **what's around it**.

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
import { getWeatherData } from '@/lib/agents/weather-agent';
import { weatherRequestSchema } from '@/lib/validators/weather';
import { apiHandler } from '@/lib/api/handler';
import { AgentError, ValidationError } from '@/lib/errors';

export const POST = apiHandler(async (request: NextRequest) => {
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
});
```

**What `apiHandler` does** — it's a higher-order function that wraps the handler in try/catch and converts any thrown error into a JSON response. **File:** `lib/api/handler.ts`
```ts
export function apiHandler<C>(handler: RouteHandler<C>): RouteHandler<C> {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
```

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
- `.parse(body)` throws a `ZodError` if invalid (caught by `apiHandler` → 400 response).
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
- `apiHandler` returns `NextResponse.json(result)` (200 OK)

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

## Where the two paths share code

Both paths call `lib/services/weather/client.ts:fetchWeather(city)`. That function is the **single source of truth** for "what is the current weather in this city".

| Layer | Path A (on-demand) | Path B (queue) |
|---|---|---|
| Entry | `app/api/weather/route.ts` | `lib/scheduler.ts` cron → `lib/workers/weather-worker.ts` |
| LLM? | ✅ Yes (Groq with `weather` tool) | ❌ No (calls `fetchWeather` directly) |
| BullMQ? | ❌ No | ✅ Yes |
| Calls | `getWeatherData` → `generateText` → `weatherTool.execute` → `fetchWeather` | `fetchWeather` directly |
| Result | Returned to the browser | Saved to `DataSnapshot` in Postgres |

The reason the agent layer is separate is so the LLM can later **choose** which tool to use (e.g., for a Strategist agent that needs both weather AND sales data). For the simple "give me today's weather" worker, we skip the LLM entirely — the answer is deterministic.

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

- **Path A** = the LLM brain. The agent is the boss. It decides what tool to call and assembles the final answer. Slow (~2-5s) because Groq is involved. User-facing.
- **Path B** = the muscle. The cron is the clock. It triggers, the worker runs, data is saved. Fast (~500ms). Machine-facing, for later AI analysis.
- Both end up at the same `fetchWeather` function. That's intentional — the data layer is shared.
- BullMQ is what makes Path B reliable. Without it, a crashed server would lose the job. With it, the job sits in Redis until some worker picks it up, with retries, rate limits, and observability built in.
