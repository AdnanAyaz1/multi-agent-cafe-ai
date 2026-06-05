# Cheatsheet — Background Jobs & Agentic AI

> Distilled mental models + minimal code patterns. Carry these, ignore the rest.
> Last updated 2026-06-05.

---

## 0. The Mental Models (5 hooks — memorize these)

1. **Three worlds.** Sync (user waits in the request) · Async (request returns 202, work happens later) · Time (cron fires it).
2. **Routes return fast, workers do slow.** If your route `await`s for more than ~1s of real work, you're doing it wrong.
3. **Cron triggers, workers work.** A cron function should finish in <100ms after enqueueing.
4. **Workers don't care who enqueued.** A user click and a 6am cron both produce the same job, handled by the same worker.
5. **`globalThis` = the dukaan's diary.** It survives HMR. Use it to remember "I already started this worker."

---

## 1. The Async Pattern (queue + worker)

Use this whenever a request triggers slow work.

### The shape

```
ROUTE                     QUEUE (Redis list)        WORKER
─────                     ─────────────────         ──────
async POST():             aiAnalysisQueue:          new Worker('ai-analysis',
  job = queue.add(...)  →  [job, job, job]        →   async (job) => {...},
  return 202 + job.id      (waiting list)              { connection })
```

### The code (minimum viable)

```ts
// lib/queue.ts
import { Queue } from 'bullmq';
export const myQueue = new Queue('my-queue', {
  connection: { url: process.env.REDIS_URL },
});

// app/api/my-route/route.ts
export async function POST(req: Request) {
  const data = await req.json();
  const job = await myQueue.add('do-work', data);
  return Response.json({ jobId: job.id }, { status: 202 });
}

// lib/worker.ts
import { Worker } from 'bullmq';
import { myQueue } from './queue';

new Worker('my-queue', async (job) => {
  console.log('processing', job.id, job.data);
  // ... do slow work
  return { ok: true };
}, { connection: { url: process.env.REDIS_URL } });
```

### The 3 rules

| Rule | Why |
|---|---|
| **Return 202 + an ID, never block** | So the request doesn't time out |
| **The job should be idempotent** | So re-runs are safe (use `upsert`, not `insert`) |
| **Use `globalThis` to remember the worker in dev** | So HMR doesn't spawn duplicates |

---

## 2. The Cron Pattern

Use this for "do X every Y".

### The shape

```
clock hits 6am
       │
       ▼
cron.schedule('0 6 * * *', async () => {
  for (const thing of things) {
    await myQueue.add('job-name', { thingId: thing.id });  // enqueue, don't do the work
  }
});
```

### The rule

**The cron function is a trigger, not a worker.** It must finish in <100ms. The work goes in the queue → worker.

```ts
// ❌ BAD — cron does the work itself
cron.schedule('0 6 * * *', async () => {
  for (const b of businesses) {
    await fetchWeather(b);  // slow, blocks timer, no retries
  }
});

// ✅ GOOD — cron enqueues, worker does it
cron.schedule('0 6 * * *', async () => {
  for (const b of businesses) {
    await myQueue.add('weather', { businessId: b.id });  // 5ms
  }
});
```

### Cron syntax (only 3 patterns you need)

```
"0 6 * * *"    → 6am every day
"*/15 * * * *" → every 15 minutes
"0 9 * * 1"    → 9am every Monday
```

---

## 3. The Agent Pattern (LLM + tool + schema)

Use this when you need language understanding, not deterministic logic.

### The shape

```
USER: "What's the weather in London?"
       │
       ▼
   ┌─────────┐
   │  Agent  │  system: "You are a weather assistant. Use the getWeather tool."
   │         │  user:   "What's the weather in London?"
   │         │  tools:  [{ name: "getWeather", parameters: zodSchema, execute: fn }]
   └────┬────┘
        │ LLM decides: "I need the tool"
        ▼
   ┌─────────┐
   │  Tool   │  execute({ city: "London" }) → fetch from Open-Meteo → return data
   └────┬────┘
        │ data flows back to LLM
        ▼
   LLM: "It's 18°C and rainy in London."
```

### The code (minimum viable)

```ts
import { generateObject } from 'ai';  // Vercel AI SDK
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import { tool } from 'ai';

const WeatherSchema = z.object({
  city: z.string(),
  temperature: z.number(),
  condition: z.string(),
});

const getWeather = tool({
  description: 'Get current weather for a city',
  parameters: z.object({ city: z.string() }),
  execute: async ({ city }) => {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?...&city=${city}`);
    return res.json();
  },
});

const { object } = await generateObject({
  model: groq('openai/gpt-oss-120b'),
  schema: WeatherSchema,
  prompt: 'Get the weather for London.',
  tools: { getWeather },
  providerOptions: { groq: { structuredOutputs: true, strictJsonSchema: false } },
});

console.log(object);  // typed! { city, temperature, condition }
```

### The 3 rules

| Rule | Why |
|---|---|
| **Use `generateObject`, not `generateText`** | You get typed, validated output — no string parsing |
| **Define a Zod schema for every tool's parameters and every agent's output** | The LLM can't return garbage; TypeScript knows the shape |
| **The tool is a function the LLM can call, not code you call** | The LLM decides when to use it — that's the "agency" |

---

## 4. The Multi-Agent Pattern (orchestrator + agents)

Use this when the task has distinct stages (analyze → propose → critique → finalize).

### The shape

```
┌──────────────────┐
│  ORCHESTRATOR    │  holds shared state, loops bounded times
└────────┬─────────┘
         │
         ▼
   ┌───────────┐    ┌───────────┐    ┌───────────┐
   │ Agent 1   │ →  │ Agent 2   │ →  │ Agent 3   │ → ...
   │ Analyzer  │    │ Strategist│    │ Critic    │
   └───────────┘    └───────────┘    └───────────┘
         │                │                │
         ▼                ▼                ▼
   { typed output } { typed output } { typed output }
         │                │                │
         └────────────────┴────────────────┘
                          │
                          ▼
                  Each output becomes
                  INPUT to the next agent
                  (passed in the prompt)
```

### The code skeleton

```ts
// lib/orchestrator.ts
async function runPipeline(input) {
  // Stage 1
  const analysis = await agent1(input);
  // Stage 2
  const plan = await agent2({ input, analysis });
  // Stage 3
  let critique = await agent3({ input, analysis, plan });
  // Bounded revision loop
  let revision = 0;
  while (critique.hasBlockers && revision < MAX_REVISIONS) {
    plan = await agent2({ input, analysis, plan, critique });
    critique = await agent3({ input, analysis, plan });
    revision++;
  }
  // Final
  return agent4({ input, analysis, plan, critique });
}
```

### The 3 rules

| Rule | Why |
|---|---|
| **Each agent has ONE job** (analyze / propose / critique / finalize) | Easier to prompt, easier to test, easier to swap |
| **Each agent's output is typed via Zod** | The next agent gets structured input, not prose to parse |
| **Bound any loop with `MAX_REVISIONS`** | Without a cap, agents can ping-pong forever (and cost you money) |

---

## 5. The Boot Pattern (HMR + workers)

Use this in any Next.js app with long-running workers.

### The shape

```
$ npm run dev
       │
       ▼
instrumentation.ts:register()  ← Next.js 16 official hook, runs ONCE
       │
       │  await import('./lib/worker')  // starts the worker
       │  startScheduler()              // starts the cron
       │
       ▼
Server is ready. Workers live in memory. They wake on jobs.
```

### The code

```ts
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  await import('./lib/workers/weather-worker');
  await import('./lib/workers/analysis-worker');
  await import('./lib/workers/competitor-worker');  // <-- new
  const { startScheduler } = await import('./lib/scheduler');
  startScheduler();
}
```

### The rule

**Workers must be imported at boot via `instrumentation.ts`, not lazily on first request.** Otherwise the first user click pays the boot cost, and you might not start the worker at all if no one hits the right route.

---

## 6. The 6 Patterns, in One Card

| # | Pattern | Trigger | Where the work runs | Use when |
|---|---|---|---|---|
| 1 | **Sync route** | User click | Inside the route (2-3s) | Quick, must show result immediately |
| 2 | **Async route** | User click | In a worker, after route returns 202 | Slow (LLM, scraping, batch) |
| 3 | **Cron** | Clock | In a worker, after cron enqueues | "Do X every Y" |
| 4 | **Agent (1 tool)** | LLM decides to call it | Inside the LLM call | Simple language-understanding task |
| 5 | **Multi-agent** | Orchestrator | In the orchestrator, chained LLM calls | Multi-stage reasoning with explainability |
| 6 | **Boot workers** | Server start | In `instrumentation.ts` | Any app with long-running workers |

---

## 7. Anti-Patterns (don't do these)

| ❌ Don't | ✅ Do |
|---|---|
| `await llmCall()` inside a route | Enqueue, return 202 |
| Put the work in the cron function | Enqueue, let a worker do it |
| Use `generateText` and parse strings | Use `generateObject` with a Zod schema |
| Run an unbounded critic loop | Bound with `MAX_REVISIONS` |
| Trust the LLM to return correct JSON | Validate with Zod (use `generateObject` which does it for you) |
| Insert without checking (in a job) | Use `upsert` (idempotent) |
| Catch errors and `console.log` | Use a structured logger + return typed errors |
| Spawn a worker in a request handler | Spawn it in `instrumentation.ts` |
| Forget `globalThis` on workers | Always wrap with the `globalThis as unknown as { ... }` pattern |

---

## 8. The 3 Questions to Ask Before Coding

1. **Will the user wait for it?**
   - Yes → Sync route
   - No → Async route (return 202, enqueue, poll)
2. **Is it triggered by a clock?**
   - Yes → Cron → enqueue same job → same worker
3. **Does the next step depend on the LLM's previous output?**
   - Yes → Multi-agent pattern (chained LLM calls, typed outputs)
   - No → Single agent with one tool

If you can answer these three, you know the shape of the code.
