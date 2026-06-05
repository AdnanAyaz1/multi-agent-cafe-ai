# App Data Flow — Beginner's Complete Guide

> **Who this is for:** You know frontend + backend. Agentic AI, queues, workers, and cron are new. Every diagram below is followed by a step-by-step walkthrough and a "why this exists" note.
>
> **Status:** Reflects code as of 2026-06-04 (see `progress.md`).

---

## 0. The One Big Idea (read this first)

Your app has **three worlds**. Every request lives in one of them. Once you see the three worlds, the rest is detail.

```
┌─────────────────────┐
│  1. SYNC WORLD      │  Request comes in → work happens → response goes out
│     (Path A)        │  Total time: 2-3 seconds
├─────────────────────┤
│  2. ASYNC WORLD     │  Request comes in → work is QUEUED → response goes out
│     (Path C)        │  Client polls later for the result
├─────────────────────┤
│  3. TIME WORLD      │  A clock fires at 6am, 7am, 9am → work is QUEUED
│     (Cron jobs)     │  No user is involved
└─────────────────────┘
```

**Everything** in this app is one of those three flows. Once you know which world you're in, you know which code to read.

| World | Trigger | Where the work happens | User waits? |
|---|---|---|---|
| Sync | User clicks a button | Inside the API route, right now | Yes |
| Async | User clicks a button | In a worker, later | No — they poll |
| Time | The clock hits 6am | In a worker, later | No one is watching |

---

## 1. Big Picture — Everything Connected

```
                         ┌──────────────────────┐
                         │   FRONTEND (browser) │
                         │  app/page.tsx        │
                         │  ├─ WeatherDisplay   │
                         │  └─ AnalysisPanel    │
                         └──────────┬───────────┘
                                    │  user clicks something
                ┌───────────────────┴────────────────────┐
                │                                        │
        SYNC (Path A)                          ASYNC (Path C)
                │                                        │
                ▼                                        ▼
   ┌────────────────────────┐              ┌──────────────────────────┐
   │ POST /api/weather      │              │ POST /api/analysis/run   │
   │ app/api/weather/       │              │ app/api/analysis/run/    │
   │   route.ts             │              │   route.ts               │
   └───────────┬────────────┘              └──────────┬───────────────┘
               │                                      │
               │ calls directly                       │ adds JOB to QUEUE
               │ (no queue)                           │ returns 202 + pipelineId
               │                                      │
               ▼                                      ▼
   ┌────────────────────────┐              ┌──────────────────────────┐
   │ lib/agents/            │              │ ai-analysis queue        │
   │   weather-agent.ts     │              │ (Redis list)             │
   │ (Groq LLM + tool)      │              │  bull:ai-analysis:wait   │
   └───────────┬────────────┘              └──────────┬───────────────┘
               │                                      │
               │ tool call                            │ worker pulls job
               ▼                                      ▼
   ┌────────────────────────┐              ┌──────────────────────────┐
   │ lib/services/weather/  │              │ analysis-worker          │
   │   client.ts            │              │ lib/workers/             │
   │ (Open-Meteo API)       │              │   analysis-worker.ts     │
   └───────────┬────────────┘              └──────────┬───────────────┘
               │                                      │
               │                                      │ runs 5-agent pipeline
               │                                      ▼
               │                          ┌──────────────────────────┐
               │                          │ lib/agents/              │
               │                          │   orchestrator.ts        │
               │                          │ (5 agents in sequence)   │
               │                          └──────────┬───────────────┘
               │                                     │
               ▼                                     ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                  PostgreSQL (Prisma 7)                       │
   │  DataSnapshot · Recommendation · RecommendationAction ·    │
   │  AgentRun · Business                                        │
   └──────────────────────────────────────────────────────────────┘


                         TIME WORLD (Cron)
                                │
              ┌─────────────────┼──────────────────┐
              │                 │                  │
              ▼                 ▼                  ▼
       6:00 AM daily     7:00 AM (stub)       9:00 AM daily
       weather-fetch     sales-pull           daily-analysis
              │                 │                  │
              └────────┬────────┴──────────────────┘
                       │
                       ▼
              same data-collect / ai-analysis queue
                       │
                       ▼
              same weather-worker / analysis-worker
                       │
                       ▼
              same PostgreSQL
```

**Key insight:** Workers don't care WHO put the job in the queue. A user clicking a button and a cron firing at 6am produce the same job, processed by the same worker. The queue is the great unifier.

---

## 2. Path A — The Sync World (Weather, 2-3 seconds)

This is the simplest flow. Everything happens in one HTTP request.

### 2.1 The diagram

```
Browser
  │  click "Get weather for London"
  ▼
components/dashboard/WeatherDisplay.tsx      ← Client Component
  │  useWeather() hook fires
  ▼
hooks/useWeather.ts
  │  fetch('/api/weather', { city: 'London' })
  ▼
app/api/weather/route.ts                     ← Next.js Route Handler
  │  Zod-validate body
  ▼
lib/agents/weather-agent.ts                  ← THE AGENT
  │  sends prompt + tools to Groq LLM
  ▼
Groq API (llama-3.1-8b-instant)
  │  LLM decides: "I need the weather tool"
  ▼
lib/agents/tools/weatherTool.ts              ← THE TOOL
  │  calls Open-Meteo
  ▼
lib/services/weather/client.ts
  │  fetch('https://api.open-meteo.com/...')
  ▼
Open-Meteo API
  │  returns weather data
  ▲
weatherTool formats it, returns to LLM
  ▲
LLM uses tool result, generates final answer
  ▲
weather-agent returns { data: WeatherPayload }
  ▲
route.ts returns NextResponse.json(data)
  ▲
useWeather hook stores it in state
  ▲
WeatherDisplay re-renders with weather UI
```

### 2.2 Step by step

| # | What happens | Where | Time |
|---|---|---|---|
| 1 | User clicks the button in browser | `components/dashboard/WeatherDisplay.tsx` | 0ms |
| 2 | `useWeather` hook fires `fetch('/api/weather', ...)` | `hooks/useWeather.ts` | 5ms |
| 3 | Network round-trip to Next.js server | — | 20-50ms |
| 4 | Route handler validates the body with Zod | `app/api/weather/route.ts` | 1ms |
| 5 | Route calls `weatherAgent(city)` | `lib/agents/weather-agent.ts` | 1ms |
| 6 | Agent sends `{ system, messages, tools }` to Groq | Groq HTTPS | 300-800ms |
| 7 | Groq LLM thinks, decides to call `getWeather` tool | Groq | included above |
| 8 | Tool is invoked → calls `fetchWeather('London')` | `lib/agents/tools/weatherTool.ts` → `lib/services/weather/client.ts` | 200-500ms |
| 9 | Open-Meteo returns weather JSON | Open-Meteo | included above |
| 10 | Tool returns data to LLM, LLM returns final answer | Groq | 200-400ms |
| 11 | Route returns JSON to browser | `app/api/weather/route.ts` | 5ms |
| 12 | Hook updates state, component re-renders | `useWeather.ts` | 5ms |
| **Total** | | | **~1-2 seconds** |

### 2.3 Why this design

- **Why a route handler, not Server Action?** Either works for sync. We use a route because it gives us explicit control over the request/response shape and the Zod validation step. Server Actions hide the HTTP.
- **Why a tool, not just an `await fetchWeather()` in the LLM prompt?** Because the LLM **decides** when to call it. If the user asks "is it raining in Paris?", the LLM can choose to call the tool first, then answer. The LLM has *agency* — that's what makes it agentic.
- **Why is the Open-Meteo call inside the agent, not pre-fetched in the route?** Because we want the LLM to be the brain. Pre-fetching would force us to know what data we need before asking the LLM, which defeats the point.

### 2.4 The "agent" term

The weather-agent is technically a **single-call LLM with one tool**. It's the simplest kind of agent. In Path C you'll see the *real* multi-agent pipeline.

---

## 3. Path C — The Async World (Full Pipeline, 30-60 seconds)

This is the one that uses queues and workers. The user does NOT wait for the full pipeline. They get a `pipelineId` immediately and poll for the result.

### 3.1 The diagram

```
USER CLICKS "ANALYZE"
        │
        ▼
components/dashboard/AnalysisPanel.tsx
        │  useAnalysis() → fetch POST /api/analysis/run
        ▼
app/api/analysis/run/route.ts                ← ENTRY POINT
        │  1. generate pipelineId (UUID)
        │  2. validate body with Zod
        │  3. aiAnalysisQueue.add('run-pipeline', { pipelineId, businessId })
        │  4. return 202 + { pipelineId }
        ▼
Browser receives 202 + pipelineId
        │  useAnalysis switches to POLLING mode
        │  setInterval(1500ms) → fetch GET /api/analysis/<pipelineId>
        ▼
        ... meanwhile, in the server ...
        ▼
Redis: bull:ai-analysis:waiting  ←  job sits here
        │
        ▼
analysis-worker (running in same Node process)  ← WAKES UP
        │  blocked on BRPOP (BullMQ's blocking pop)
        │  job arrives → moves to bull:ai-analysis:active
        ▼
lib/workers/analysis-worker.ts
        │  calls runPipeline({ pipelineId, businessId })
        ▼
lib/agents/orchestrator.ts                   ← THE BRAIN OF PATH C
        │
        │  Step 1: MenuAnalyst
        │  ├─ prompt: "Categorize the menu items"
        │  ├─ calls Groq
        │  └─ writes AgentRun row (status=complete, duration, tokens)
        │
        │  Step 2: WeatherAnalyst
        │  ├─ prompt: "Summarize today's weather and what it means"
        │  ├─ calls Groq
        │  └─ writes AgentRun row
        │
        │  Step 3: Strategist
        │  ├─ prompt: "What should we promote, discount, hold?"
        │  ├─ calls Groq
        │  └─ writes AgentRun row
        │
        │  Step 4: Critic
        │  ├─ prompt: "Is the strategist's plan any good? Push back."
        │  ├─ calls Groq
        │  └─ writes AgentRun row
        │
        │  IF critic has BLOCKERS:
        │    └─ loop back to Strategist with critic's feedback
        │       (bounded: MAX_REVISIONS, default 1)
        │
        │  Step 5: Synthesizer
        │  ├─ prompt: "Write the final briefing for the cafe owner"
        │  ├─ calls Groq
        │  └─ writes AgentRun row
        │
        │  Persist:
        │  ├─ Recommendation row (summary, reasoning, confidence)
        │  └─ RecommendationAction rows (one per action)
        ▼
Redis: bull:ai-analysis:completed
        │
        ▼
analysis-worker returns
        ▼
        ... meanwhile, in the browser ...
        ▼
GET /api/analysis/<pipelineId> (1.5s poll)
        │  returns: { status, agentRuns: [...], recommendation: {...} }
        ▼
AnalysisPanel re-renders with live timeline + final briefing
        │
        ▼
User sees: "Hot chocolate — discount 15% (it's cold and rainy)"
```

### 3.2 Step by step

| # | Who | What | Where | Notes |
|---|---|---|---|---|
| 1 | User | Clicks "Run Analysis" | `AnalysisPanel.tsx` | One click triggers the whole thing |
| 2 | Hook | POST /api/analysis/run | `hooks/useAnalysis.ts` | Sends `{ businessId }` |
| 3 | Route | Validate, generate `pipelineId`, enqueue | `app/api/analysis/run/route.ts` | This is fast — no LLM call here |
| 4 | Route | Return `202 Accepted` + `{ pipelineId }` | same | **202 means "I accepted your request, the work is happening"** |
| 5 | Hook | Switch to polling, every 1.5s | `useAnalysis.ts` | Starts polling GET /api/analysis/[pipelineId] |
| 6 | Worker | Wakes up (was blocked on the queue) | `lib/workers/analysis-worker.ts` | Subscribed to `ai-analysis` queue |
| 7 | Worker | Calls `runPipeline(data)` | → `orchestrator.ts` | The real work begins |
| 8 | Orchestrator | Loads menu + weather, runs 5 agents in sequence | `lib/agents/orchestrator.ts` | Each agent writes its own `AgentRun` row |
| 9 | Orchestrator | Persists `Recommendation` + `RecommendationAction[]` | Prisma | Final DB writes |
| 10 | Worker | Returns success, job moves to `completed` | Redis | |
| 11 | Poll | GET /api/analysis/[pipelineId] returns full status | route returns DB rows | Client now sees the result |
| 12 | UI | Re-renders with timeline + briefing | `AnalysisPanel.tsx` | Done |

### 3.3 Why HTTP 202 (not 200)?

| Code | Meaning | Use when |
|---|---|---|
| 200 OK | "Here's the answer" | Sync (Path A) |
| 202 Accepted | "I got it, the work is happening, come back later" | Async (Path C) |
| 504 Timeout | "I waited too long, gave up" | (Not used here) |

The user doesn't sit on the loading spinner for 30 seconds. They get an immediate "we're working on it" with an ID, then poll. **This is how every modern app that does heavy work handles it.**

### 3.4 Why polling, not SSE/WebSockets?

We chose polling for v1 because:
- It works through any load balancer, proxy, or CDN
- It survives disconnects (the client just polls again)
- It's simple to debug (just `curl` the endpoint)

SSE/WebSockets add complexity. We'll add SSE later (TODO in `progress.md`).

---

## 4. The 5-Agent Pipeline (in detail)

This is the **agentic AI heart** of the app. Each agent is one LLM call with a Zod schema for the output.

### 4.1 The agents, in order

```
                  ┌──────────────────────┐
                  │   ORCHESTRATOR       │
                  │ (the project manager)│
                  └──────────┬───────────┘
                             │
        ┌────────────────────┼─────────────────────┐
        │                    │                     │
        ▼                    ▼                     ▼
   ┌─────────┐         ┌─────────┐            ┌──────────┐
   │  Agent 1│         │  Agent 2│            │  Agent 3 │
   │  Menu   │         │ Weather │            │ Strategy │
   │ Analyst │         │ Analyst │            │          │
   └────┬────┘         └────┬────┘            └─────┬────┘
        │                   │                       │
        │ reads:            │ reads:                │ reads:
        │ • menu items      │ • weather snapshot    │ • Menu analysis
        │ writes:           │ • seasonal signals    │ • Weather analysis
        │ • categorization  │ writes:              │ writes:
        │                   │ • impact summary      │ • promote[]
        │                   │                       │ • discount[]
        │                   │                       │ • hold[]
        └───────────────────┴───────────┬───────────┘
                                         │
                                         ▼
                                    ┌─────────┐
                                    │  Agent 4│
                                    │  Critic │
                                    └────┬────┘
                                         │
                       ┌─────────────────┴──────────────────┐
                       │ has BLOCKERS?                      │
                       │                                     │
                  YES ──┤── loop back to Strategist         │
                       │    (with critic's feedback)        │
                       │    bounded: MAX_REVISIONS = 1      │
                       │                                     │
                       └── NO → continue                     │
                                                         │
                                                         ▼
                                                    ┌──────────┐
                                                    │  Agent 5 │
                                                    │  Synth   │
                                                    └────┬─────┘
                                                         │
                                                         │ writes:
                                                         │ • final brief
                                                         │ • confidence
                                                         │ • action list
                                                         ▼
                                                  DB: Recommendation
```

### 4.2 What each agent is, in plain English

| # | Agent | What it does | Plain English |
|---|---|---|---|
| 1 | **MenuAnalyst** | Looks at the menu, tags each item (hot/cold/drinks/food/dessert), notes prices | "Organize the menu so the next guy can think clearly." |
| 2 | **WeatherAnalyst** | Looks at today's weather, explains what it means for the cafe | "Translate weather into business signal." |
| 3 | **Strategist** | Proposes what to promote, discount, hold | "Here's what I think we should do." |
| 4 | **Critic** | Challenges the plan: "Are you sure? What about X?" | "Wait, is this actually a good idea?" |
| 5 | **Synthesizer** | Writes the final briefing for the cafe owner | "OK, here's the final plan in plain language." |

### 4.3 The life of one agent call

Every agent follows the same shape. Here's what happens when `orchestrator` calls `menuAnalyst`:

```
orchestrator.runMenuAnalyst({ menu })
  │
  ▼
lib/agents/menu-analyst.ts
  │
  │  1. build the prompt (lib/agents/prompts.ts)
  │     "You are a menu analyst. Categorize these items..."
  │
  │  2. pick the model (lib/agents/models.ts)
  │     e.g. llama-3.1-8b-instant
  │
  │  3. call withAgentRun() (lib/agents/run.ts)
  │     ┌──────────────────────────────────────────────┐
  │     │ withAgentRun({ agentName, schema, prompt, fn }) {
  │     │   1. create AgentRun row (status=running)
  │     │   2. const start = Date.now()
  │     │   3. try {
  │     │        const result = await fn()  // ← actual LLM call
  │     │        update AgentRun (status=complete, durationMs, tokens)
  │     │        return result
  │     │      } catch (err) {
  │     │        update AgentRun (status=failed, error)
  │     │        throw
  │     │      }
  │     │ }
  │     └──────────────────────────────────────────────┘
  │
  │  4. inside fn(): generateObject({ model, schema, prompt })
  │     ↓ Groq returns typed object matching the Zod schema
  │
  ▼
returns MenuAnalysis { items: [{ name, category, tags, price }] }
```

**Why `generateObject` (not `generateText`)?** Because the next agent needs **typed data** to work with. We use Zod schemas everywhere so:
- The LLM can't return garbage
- TypeScript knows the shape
- The next agent can `result.items.map(...)` without parsing strings

### 4.4 The critic loop (bounded)

The Critic can send the plan back to the Strategist. Without a bound, they could ping-pong forever.

```
Strategist proposes plan
        │
        ▼
Critic reviews
        │
   ┌────┴────┐
   │ blockers?│
   └────┬────┘
        │
  no ───┤──── go to Synthesizer → done
        │
  yes ──┤
        ▼
  Has MAX_REVISIONS been hit?  (env, default 1)
        │
  no ───┤──── go back to Strategist with critic's feedback
        │
  yes ──┤──── skip the loop, go to Synthesizer (with a note)
        ▼
      Synthesizer
```

The "feedback" is just appended to the Strategist's prompt:
> "The critic said: 'You forgot to consider that iced drinks still sell in the morning.' Revise your plan."

---

## 5. Queues, Jobs, Workers — The Async Plumbing

This is the part most newcomers find hardest. Let's break it down.

### 5.1 What is a queue?

A queue is a **list of "things to do" sitting in Redis**. That's it. No magic.

```
Redis list:  bull:ai-analysis:waiting
             ┌────────────────────┐
             │ { pipelineId: x,   │  ← oldest, taken first
             │   businessId: y }  │
             ├────────────────────┤
             │ { pipelineId: z,   │  ← next
             │   businessId: w }  │
             └────────────────────┘
```

### 5.2 What is a job?

A job is **one item in the queue**. It has:
- `name` — what kind of job (e.g. `'run-pipeline'`)
- `data` — the payload (e.g. `{ pipelineId, businessId }`)
- `id` — UUID
- `attempts` — how many times we've tried
- `opts` — priority, retries, delays

A job is just JSON. Look at the Redis dump from `REDIS-BULLMQ-CRON-GUIDE.md` — it's literally a string in a list.

### 5.3 What is a worker?

A worker is **a long-running function that says "tell me when there's a job, I'll process it"**.

```ts
// lib/workers/analysis-worker.ts — simplified
const analysisWorker = new Worker('ai-analysis', async (job) => {
  console.log('Got job', job.id);
  await runPipeline(job.data);
}, { connection: redisConnection });

// What this does, behind the scenes:
// 1. Connects to Redis
// 2. Sends: BRPOP bull:ai-analysis:waiting 0   (block forever)
// 3. When a job appears, it gets pushed back
// 4. Runs your async function with the job
// 5. On success: moves job to :completed
// 6. On failure: retries (with backoff) or moves to :failed
```

### 5.4 The 3 states a job can be in

```
   ┌─────────┐
   │ waiting │  ← in the queue, waiting for a worker
   └────┬────┘
        │ worker picks it up
        ▼
   ┌─────────┐
   │ active  │  ← worker is processing it
   └────┬────┘
        │
   ┌────┴──────────────┐
   ▼                   ▼
┌──────────┐      ┌────────┐
│ completed│      │ failed │
└──────────┘      └────┬───┘
                       │ if attempts < maxAttempts
                       │ → back to waiting (retry)
                       ▼
                   (stays in :failed forever, for you to inspect)
```

### 5.5 Why we don't just call the function?

The naive approach:

```ts
// ❌ DON'T DO THIS in an API route
export async function POST() {
  await runPipeline({ ... });  // 30 seconds
  return NextResponse.json({ done: true });
}
```

Problems:
1. **Timeout** — most servers kill requests after 30s
2. **User waits** — bad UX, no progress
3. **If user closes the tab, work is lost**
4. **Can't retry** — one network blip = dead
5. **Can't scale** — one route, one job at a time
6. **Can't run on a schedule** — only on user click

The queue approach:

```ts
// ✅ DO THIS
export async function POST() {
  await aiAnalysisQueue.add('run-pipeline', data);  // 5ms
  return NextResponse.json({ pipelineId }, { status: 202 });
}
```

Benefits:
1. Route returns in 5ms, no timeout
2. User gets immediate feedback
3. User can close the tab — work continues
4. BullMQ retries with exponential backoff
5. Multiple workers (or processes) can process in parallel
6. **Same queue can be fed by cron jobs** — see Time World

### 5.6 The "why does this exist" table

| Concept | Why it exists |
|---|---|
| **Queue** | To decouple "request received" from "work done". Lets the API respond fast. |
| **Job** | A unit of work, serialized, with retries + metadata. Survives crashes (it's in Redis). |
| **Worker** | A long-running process that pulls jobs and does the work. Can run in same process as Next.js (dev) or separate (prod). |
| **Redis** | The storage. RAM-based, super fast, lists are natural for queues. |
| **Priority** | High-priority jobs (user clicking) jump ahead of low-priority jobs (cron). |
| **Retries** | LLM calls can flake. Network can drop. Retries make it resilient. |
| **Rate limiting** | Open-Meteo/Groq can ban us if we call too fast. `limiter: { max: 10, duration: 60000 }` enforces it. |

### 5.7 Idempotency — the thing you MUST think about

**Rule:** A job should be safe to run more than once, even if it was already done.

Why? Because:
- User clicks twice → 2 jobs enqueued
- Network glitch → client retries
- Cron fires twice (clock drift)

In our app, the orchestrator is naturally idempotent: it creates a new `Recommendation` row each time, identified by `pipelineId`. The user sees "the latest one" via the polling endpoint.

**Bad example (DON'T do):**
```ts
// ❌ Not idempotent
async function job() {
  await prisma.user.update({ where: { id }, data: { count: { increment: 1 } } });
}
// If this runs twice, the user gets +2 instead of +1
```

**Good example (DO this):**
```ts
// ✅ Idempotent
async function job() {
  await prisma.recommendation.upsert({
    where: { pipelineId },
    create: { ... },
    update: { ... },  // safe to re-run
  });
}
```

---

## 6. Cron Jobs — The Time World

Cron jobs are **code that runs on a schedule, not on user action**.

### 6.1 Where cron lives in this app

```
next dev starts
     │
     ▼
instrumentation.ts:register()           ← Next.js 16 official boot hook
     │
     │  if (process.env.NEXT_RUNTIME === 'nodejs') {
     │    await import('./lib/workers/weather-worker');
     │    await import('./lib/workers/analysis-worker');
     │    const { startScheduler } = await import('./lib/scheduler');
     │    startScheduler();
     │  }
     ▼
lib/scheduler.ts                       ← THE SCHEDULER
     │
     │  cron.schedule('0 6 * * *', weatherFetchJob)   // 6am daily
     │  cron.schedule('0 7 * * *', salesPullJob)      // 7am daily (stub)
     │  cron.schedule('0 9 * * *', dailyAnalysisJob)  // 9am daily
     ▼
Node-cron keeps a timer running forever
     │
     │  at 6:00:00.000 AM:
     ▼
weatherFetchJob()
     │  for each Business in DB:
     │    dataCollectQueue.add('weather-fetch', { businessId, city })
     ▼
     ... goes into the same async flow as Path C ...
```

### 6.2 The 3 cron jobs we have

| Cron expression | Name | What it does | Takes | Returns |
|---|---|---|---|---|
| `0 6 * * *` | `weather-fetch` | For each business, fetch today's weather and store a `DataSnapshot` | Nothing (queries DB itself) | Enqueues N jobs to `data-collect` queue |
| `0 7 * * *` | `sales-pull` | Stub for now (TODO 3) | — | — |
| `0 9 * * *` | `daily-analysis` | For each business, run the full 5-agent pipeline and persist a `Recommendation` | Nothing (queries DB) | Enqueues N jobs to `ai-analysis` queue |

### 6.3 Cron syntax cheat sheet

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sun=0)
│ │ │ │ │
* * * * *

"0 6 * * *"   → 6:00 AM every day
"0 9 * * 1"   → 9:00 AM every Monday
"*/15 * * * *" → every 15 minutes
"0 0 1 * *"   → midnight on the 1st of every month
```

### 6.4 What happens if a cron job fails?

Three layers of safety:

| Layer | What happens | Where |
|---|---|---|
| 1. Cron itself | If the function throws, it's caught and logged. Next cron still fires. | `lib/scheduler.ts` |
| 2. Queue → Worker | If the job itself fails, BullMQ retries with exponential backoff. | `lib/workers/*.ts` |
| 3. Worker exhaustion | If all retries fail, job goes to `:failed` list. You can inspect it later. | Redis |

**Beginner tip:** ALWAYS log inside cron functions. Otherwise, when the 6am job silently fails, you find out 3 days later when the dashboard is empty.

### 6.5 Why cron jobs exist

| Reason | Example |
|---|---|
| **Periodic data collection** | "Refresh weather for all cafes at 6am" |
| **Daily automation** | "Run the AI briefing every morning at 9am" |
| **Cleanup** | "Delete old DataSnapshots at 2am" |
| **Reports** | "Email the owner a PDF every Monday" |

The alternative — having a user click a button every morning — is not realistic.

### 6.6 Cron does NOT do the work itself

**Critical rule:** The cron function should be a **trigger**, not the worker.

```ts
// ❌ BAD: cron does the work itself (blocks the timer, no retries)
cron.schedule('0 6 * * *', async () => {
  const businesses = await prisma.business.findMany();
  for (const b of businesses) {
    await fetchWeather(b.city);  // 5 sec × 10 cafes = 50 sec blocking
    await prisma.snapshot.create(...);
  }
});

// ✅ GOOD: cron enqueues, worker does the work
cron.schedule('0 6 * * *', async () => {
  const businesses = await prisma.business.findMany();
  for (const b of businesses) {
    await dataCollectQueue.add('weather-fetch', { businessId: b.id });
    // 5ms. Returns. Timer is free. Worker handles the rest.
  }
});
```

The reason is the same as the API case: cron should respond in milliseconds. The slow work goes in the worker.

---

## 7. The Boot Story (instrumentation.ts)

This is the part most people miss: **how do the workers and cron jobs even start?**

### 7.1 The problem

When you run `next dev`, Next.js loads your pages and API routes on demand. If nothing imports `lib/workers/analysis-worker.ts`, that file never runs. No worker. No queue subscription. Nothing.

### 7.2 The fix

Next.js 16 has a special file: `instrumentation.ts` at the project root. It runs **once on server start**, before any request is served.

```ts
// instrumentation.ts (simplified)
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;  // skip on Edge

  // 1. Start workers (each opens a Redis subscription)
  await import('./lib/workers/weather-worker');
  await import('./lib/workers/analysis-worker');

  // 2. Start the cron scheduler
  const { startScheduler } = await import('./lib/scheduler');
  startScheduler();

  console.log('[boot] workers and scheduler initialized');
}
```

### 7.3 The full cold-start timeline

```
$ npm run dev
     │
     ▼
Next.js starts
     │
     ▼
instrumentation.ts:register() runs        ← ONCE
     │
     │  imports weather-worker.ts
     │  → top-level `new Worker('data-collect', ...)` opens Redis sub
     │
     │  imports analysis-worker.ts
     │  → top-level `new Worker('ai-analysis', ...)` opens Redis sub
     │
     │  imports scheduler.ts
     │  → startScheduler() registers 3 cron timers
     │
     ▼
Next.js reports "Ready"
     │
     ▼
Browser can now hit /
     │
     ▼
User clicks "Analyze"
     │
     ▼
POST /api/analysis/run → enqueues job
     │
     ▼
analysis-worker (already running!) picks it up
     │
     ▼
5-agent pipeline runs
```

**The key insight:** workers are started **once at boot**, then they sit in memory waiting for jobs. They're not "spun up per request".

### 7.4 Why `globalThis`?

In dev, Next.js does HMR (Hot Module Reload) — it re-runs files when you save them. Without `globalThis`, the worker file would re-run, creating a NEW worker. After 20 saves, you'd have 20 workers all trying to grab the same job.

```ts
// lib/workers/analysis-worker.ts
const globalForWorker = globalThis as unknown as {
  analysisWorker: Worker | undefined;
};

export const analysisWorker =
  globalForWorker.analysisWorker ?? new Worker('ai-analysis', async (job) => {
    // ...
  });

if (process.env.NODE_ENV !== 'production') {
  globalForWorker.analysisWorker = analysisWorker;
}
```

`globalThis` is a permanent scratchpad that survives HMR. We write "I already have a worker" there. On the next HMR, we read it first.

This is the **only** time you should ever use `globalThis` in this app. See `LEARN.md` for the full dukaan analogy.

---

## 8. The Data Flow in One Picture (Summary)

```
            ┌─────────────────────────────────────────────────────┐
            │                  TRIGGERS                            │
            │                                                      │
            │   [A] User clicks a button      [B] Clock hits 6am   │
            │       (Path A or Path C)            (Cron job)        │
            └────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   Path A (sync)                    Path C / Cron (async)
        │                                 │
        ▼                                 ▼
   ┌─────────┐                      ┌──────────┐
   │  Route  │                      │  Route / │
   │ handler │                      │  Cron fn │
   └────┬────┘                      └─────┬────┘
        │                                 │ add job
        │                                 ▼
        │                            ┌─────────┐
        │                            │  Queue  │ (Redis list)
        │                            └────┬────┘
        │                                 │ worker pulls
        │                                 ▼
        │                            ┌─────────┐
        │                            │ Worker  │
        │                            └────┬────┘
        │                                 │
        │  ┌──────────────────────────────┘
        │  │
        ▼  ▼
   ┌─────────────────┐
   │  Agent(s)       │  ← LLM call(s) with tools + Zod schema
   └────┬────────────┘
        │  tool calls
        ▼
   ┌─────────────────┐
   │  External API   │  ← Open-Meteo (weather)
   └────┬────────────┘
        │  results
        ▼
   ┌─────────────────┐
   │  Database       │  ← Prisma → PostgreSQL
   │  (Prisma 7)     │     • DataSnapshot
   └─────────────────┘     • Recommendation
                           • RecommendationAction
                           • AgentRun
                           • Business
```

---

## 9. Architecture Rules (the "why" of it all)

### 9.1 Why queues/workers exist

| Problem | Queue/Worker solves it by |
|---|---|
| API requests can take minutes (LLMs) | API returns in 5ms, work happens async |
| Network blips kill in-flight work | BullMQ retries with backoff |
| We hit rate limits on Groq | `limiter: { max, duration }` |
| One server can't handle 100 cafes | Workers scale horizontally |
| We want to track each job's status | BullMQ stores state in Redis |
| We want to run on a schedule | Cron enqueues the same jobs |

### 9.2 Why cron jobs exist

| Problem | Cron solves it by |
|---|---|
| Data goes stale (weather changes) | Refresh every morning at 6am |
| Owner doesn't log in every day | Daily briefing appears automatically |
| Reports are time-based (daily, weekly) | Triggered by clock, not by user |
| Cleanup needed regularly | "Delete old stuff" at 2am |

### 9.3 When to use an agent vs. a normal function

| Use an agent when... | Use a normal function when... |
|---|---|
| The decision needs language understanding ("is it cold enough to discount soup?") | The logic is deterministic ("if temp < 10, add hot drinks") |
| The output should be human-readable prose or summaries | The output is structured data |
| You want to explain *why* to the user | The user just needs the answer |
| The input is messy/unstructured (menu text, weather narrative) | The input is clean/typed |
| You need to chain reasoning (analyze → decide → critique → revise) | The logic is one-step |

**Rule of thumb:** If you can write the logic in 10 lines of TypeScript, don't use an agent. Agents are expensive (latency, money, nondeterminism). Use them for things humans do with intuition, not math.

### 9.4 What should NEVER happen inside an API route

| ❌ Never | ✅ Do this instead |
|---|---|
| Call Groq directly in the route and wait 30s | Enqueue, return 202 |
| Loop over cafes and call APIs serially | Enqueue N jobs, workers process in parallel |
| `setTimeout` to "delay" work | Use a job with `delay: 5000` |
| Catch and swallow errors | Log via `lib/logger.ts`, return typed error |
| Write business logic | Put it in `utils/` |
| Talk to DB directly from a Client Component | Server Component or route handler does it |

### 9.5 Common beginner mistakes

| Mistake | Why it hurts | Fix |
|---|---|---|
| Putting `await llmCall()` in the route | 30s timeout, bad UX | Enqueue, return 202 |
| Forgetting `globalThis` on workers | After 10 saves, 11 workers all grabbing the same job | Wrap with `globalThis as unknown as { ... } ??` |
| Running cron function does the work itself | 50-second blocking call, no retries | Cron enqueues, worker does work |
| Re-running a job that's already done (e.g. credit user twice) | Duplicate data | Make the job idempotent (upsert, not insert) |
| Putting `import 'server-only'` in a Client Component | Build error | Mark only the truly server-only modules |
| Reading DB from a Client Component | DB credentials leak to the browser | Use Server Components / routes |
| Returning raw `any` from agents | Next agent gets garbage, TypeScript can't help | Use Zod schemas, get typed objects |
| `console.log` in production paths | Spams logs, no structure | Use `lib/logger.ts` with `child(scope)` |
| Long-running worker in dev dies with the terminal | Lost jobs in memory | Use `Start-Process cmd.exe /c "npm run dev"` (Windows) or `nohup` (Linux) |

---

## 10. Quick Reference — "What code handles X?"

| If you want to change... | Edit this file |
|---|---|
| The weather UI | `components/dashboard/WeatherDisplay.tsx` |
| The analysis UI (button, timeline, briefing) | `components/dashboard/AnalysisPanel.tsx` |
| The analysis polling logic | `hooks/useAnalysis.ts` |
| The sync weather agent (Path A) | `lib/agents/weather-agent.ts` |
| The sync weather route | `app/api/weather/route.ts` |
| The async pipeline entry | `app/api/analysis/run/route.ts` |
| The async pipeline status (polled) | `app/api/analysis/[pipelineId]/route.ts` |
| The 5-agent orchestration | `lib/agents/orchestrator.ts` |
| One of the 5 agents | `lib/agents/{menu-analyst,weather-analyst,strategist,critic,synthesizer}.ts` |
| An agent's prompt | `lib/agents/prompts.ts` |
| An agent's model choice | `lib/agents/models.ts` |
| The retry/audit wrapper | `lib/agents/run.ts` |
| The analysis worker | `lib/workers/analysis-worker.ts` |
| The weather worker | `lib/workers/weather-worker.ts` |
| The cron schedule | `lib/scheduler.ts` |
| The boot sequence | `instrumentation.ts` |
| The Open-Meteo client | `lib/services/weather/client.ts` |
| The DB connection | `lib/db.ts` |
| The Redis connection | `lib/redis.ts` |
| The Prisma schema | `prisma/schema.prisma` |

---

## 11. TL;DR — 5 things to remember

1. **Three worlds:** Sync (user waits), Async (user polls), Time (cron fires).
2. **Workers don't care who enqueued.** User click and cron job put the same job in the same queue, processed by the same worker.
3. **HTTP 202 = "we're working on it."** The user gets a `pipelineId` and polls for the result. They never sit on a spinner for 30 seconds.
4. **`globalThis` on workers + `instrumentation.ts` at boot** = workers run once on server start, survive HMR, don't duplicate on save.
5. **Cron is a trigger, not a worker.** The cron function returns in 5ms after enqueueing. The slow work happens in a worker. Same reason as the API case.
