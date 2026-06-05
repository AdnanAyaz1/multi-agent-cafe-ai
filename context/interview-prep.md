# Interview Prep — How to Present This Project

> Goal: a 20–30 min walkthrough that lands as a story, not a list of files.
> Last updated 2026-06-04.

---

## 0. The Elevator Pitch (memorize this — 30 seconds)

> "I built a multi-agent AI platform that helps cafe owners decide what to promote or discount each day, based on weather and the menu. The interesting parts are: a 5-agent pipeline (analyst → strategist → critic → synthesizer), a bounded critic revision loop, HTTP 202 + polling for long-running LLM work, BullMQ workers started via Next.js 16's `instrumentation.ts` boot hook, and cron-scheduled daily briefings. I had to work around Prisma 7's new driver-adapter requirement, Next.js 16's `RouteContext` async API, and HMR duplicating workers in dev."

If they ask follow-ups, branch into the deeper sections below.

---

## 1. The Story Arc (use this order — every section earns the next)

```
1. THE PROBLEM (30s)              — why this exists
2. THE BIG IDEA (30s)             — multi-agent, not one prompt
3. THE ARCHITECTURE (2 min)       — the 3 worlds, the boot story
4. THE AGENT PIPELINE (3 min)     — the meat of the project
5. THE ASYNC PLUMBING (2 min)     — why queues/workers
6. KEY DECISIONS & TRADEOFFS (5m) — the part that gets you hired
7. ISSUES I HIT (2 min)           — shows real engineering
8. WHAT I'D DO NEXT (2 min)       — shows growth + self-awareness
9. DEMO (live or recorded)        — show, don't tell
```

**Why this order:** problem → idea → architecture → meat → plumbing → tradeoffs → war stories → future. Each section answers a question the interviewer is already forming in their head. By the time you reach tradeoffs, they trust you and want the details.

---

## 2. Section-by-Section Talking Points

### 2.1 The Problem (30 seconds)

> "Cafe owners guess what to promote. A hot soup sells better on a rainy day; an iced latte sells better at 32°C. I wanted to turn that intuition into a reasoned, transparent recommendation — every day, with explanations the owner can read."

**Why this works:** shows you started with a real problem, not a tech demo. Interviewers want to see product thinking.

### 2.2 The Big Idea (30 seconds)

> "I used a multi-agent setup — 5 specialized agents — instead of one giant prompt. Each agent has one job: analyze the menu, analyze the weather, propose a strategy, critique it, then write the final briefing. The owner can see *which agent said what*, so the recommendation is explainable, not a black box."

**Key phrase to land:** "explainable, not a black box." That's the reason multi-agent exists. Say it.

### 2.3 The Architecture (2 minutes)

Draw the 3-worlds picture on a whiteboard (or screen-share the diagram from `flow-diagram.md` § 1):

```
   SYNC (Path A)              ASYNC (Path C)              TIME (Cron)
   click → route → agent       click → 202 + id            6am, 7am, 9am
        → tool → API           → poll → worker                    │
        → JSON                     → 5-agent pipeline     enqueue same jobs
                                   → DB write                    ▼
                                                            same workers
```

Then explain the **one insight that makes it all work**:

> "The workers don't care who put the job in the queue. A user clicking a button and a 6am cron both produce the same job, processed by the same worker. The queue is the great unifier."

**If they ask "why separate the sync and async paths?":**
> "Path A is for quick tool-calling — under 3 seconds — so I keep it inline. Path C is the full 5-agent pipeline, which takes 30–60 seconds, so I return HTTP 202 immediately and the client polls. Different latency needs, different shapes."

### 2.4 The Agent Pipeline (3 minutes — the meat)

Walk through the 5 agents in order. For each, say: **what it does** and **what input it takes from the previous agent**.

```
MenuAnalyst      → categorizes menu items
WeatherAnalyst   → interprets weather for a cafe
Strategist       → proposes promote / discount / hold
Critic           → challenges the plan, can send it back
Synthesizer      → writes the final owner-facing briefing
```

**Key points to land:**

1. **Each agent uses `generateObject` with a Zod schema.** I never parse strings.
2. **The critic loop is bounded (`MAX_REVISIONS = 1`).** Without a cap, the strategist and critic could ping-pong forever and burn money.
3. **Every agent call writes an `AgentRun` row.** I get full audit: agent name, duration, tokens, status, error. If something looks wrong, I can replay the exact LLM call.

**Likely question: "Why 5 agents and not 1 big prompt?"**

> "Three reasons. First, prompt quality: each agent has a focused system prompt — easier to tune, easier to test. Second, cost: I use `llama-3.1-8b-instant` for the simple agents and `llama-3.3-70b-versatile` for the harder ones (strategist, critic). One big prompt forces me to use the expensive model for everything. Third, explainability: the owner can see which agent said what, and the critic's challenges are visible. One big prompt is a black box."

**Likely question: "Why does the critic send it back, not just edit it?"**

> "Because the strategist owns the creative decision. The critic's job is to point out problems — 'you forgot iced drinks sell in the morning' — not to write the plan. Keeping the roles separate means each agent stays focused."

### 2.5 The Async Plumbing (2 minutes)

Walk through Path C end-to-end:

```
POST /api/analysis/run
  ↓
Zod-validate body
  ↓
aiAnalysisQueue.add('run-pipeline', { pipelineId, businessId })
  ↓
return 202 + { pipelineId }   ← 5ms total
  ↓
analysis-worker (already running, was blocked on the queue) wakes up
  ↓
calls orchestrator → 5 agents → writes Recommendation + AgentRun rows
  ↓
client polls GET /api/analysis/[pipelineId] every 1.5s
  ↓
sees final briefing
```

**Key points:**

1. **HTTP 202 = "I accepted your request, the work is happening."** Not 200 (no answer yet), not 504 (didn't wait).
2. **Polling, not SSE.** Simpler, works through any load balancer, survives disconnects.
3. **Idempotency:** the orchestrator's writes are naturally idempotent — each pipeline has a unique `pipelineId`, the `Recommendation` row is keyed by it. If the job runs twice (user double-clicks, network retry), the second run creates a new row, not a duplicate update.

**Likely question: "Why BullMQ and not just call the function in a `setTimeout`?"**

> "Three reasons. First, **persistence** — BullMQ stores jobs in Redis, so a server crash doesn't lose them. Second, **retries** — exponential backoff is built in. Third, **rate limiting** — `limiter: { max: 10, duration: 60000 }` prevents me from getting banned by Groq."

### 2.6 Key Decisions & Tradeoffs (5 minutes — this section gets you hired)

This is the meat of the interview. For each decision, name **what you chose, what you rejected, and why**.

| # | Decision | Chose | Rejected | Why |
|---|---|---|---|---|
| 1 | LLM provider | Groq | OpenAI, self-hosted Ollama | Free tier, fast inference, OpenAI-compatible API. Ollama adds infra cost. |
| 2 | Agent orchestration | 5 separate agents | 1 big prompt | Focused prompts, model-per-agent (cheap model for simple tasks), explainability |
| 3 | Agent output format | `generateObject` + Zod | `generateText` + string parsing | Typed outputs, validation free, no parsing bugs |
| 4 | Agent loop bound | `MAX_REVISIONS = 1` | Unbounded | Prevents infinite ping-pong, controls cost |
| 5 | Async pattern | HTTP 202 + polling | SSE, WebSockets | Survives load balancers, no connection state, simple to debug |
| 6 | Queue | BullMQ + Redis | `setTimeout`, custom queue | Persistence, retries, rate limiting, priority, observability |
| 7 | Boot pattern | `instrumentation.ts` | Import in layout, custom server | Official Next.js 16 hook, runs once on server start |
| 8 | Prisma | Prisma 7 + driver adapter | Prisma 6 | v7 is current; learned the new pattern (no `datasourceUrl`) |
| 9 | DB | PostgreSQL | SQLite | Time-series data, history, future analytics |
| 10 | Weather | Open-Meteo | Paid API | Free, no API key, good enough for v1 |
| 11 | Multi-agent vs single | Multi-agent | "Just call the LLM" | Each agent = focused system prompt; cheaper models for simple agents |
| 12 | Sync vs async agent | Both (Path A + Path C) | One or the other | Quick "what's the weather" = sync; full briefing = async |
| 13 | Streaming vs polling | Polling first | SSE from day 1 | Ship faster, add SSE later (noted in `progress.md`) |
| 14 | UI | shadcn/ui + Tailwind v4 | Custom CSS | Accessible primitives, no design debt, fast iteration |
| 15 | Logger | Custom `lib/logger.ts` with `child(scope)` | `console.log` | Structured logs, scoping per agent, ready for prod log aggregation |

**Likely question: "If you were starting over, what would you change?"**

> "Three things. First, I'd add **SSE streaming** of agent output from day 1 — polling works but the user experience is much better with live updates. Second, I'd use **a typed config schema** for `Business.config` instead of `Json?` — it bit me when I added a new field. Third, I'd invest in **end-to-end tests for the orchestrator** with mocked LLM responses — I have integration tests, but a true unit test of the state machine would have caught one revision-loop bug I shipped and patched."

### 2.7 Issues I Hit (2 minutes — shows real engineering)

This section proves you've actually built something, not read about it.

> "Three real issues I had to debug:"

**Issue 1: Prisma 7 dropped `datasourceUrl`.**

> "When I upgraded, my `new PrismaClient({ datasourceUrl })` started throwing `Unknown property`. I learned v7 requires a **driver adapter** — the schema still works for migrations, but the client construction is different. I installed `@prisma/adapter-pg` and rewrote `lib/db.ts` to `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`."

**Issue 2: Workers were being duplicated on every save.**

> "Next.js dev mode does HMR. My worker file was re-running, creating a new `new Worker(...)` on every save. After 10 saves I had 10 workers all trying to grab the same job. Fix: stash the worker in `globalThis` (a permanent scratchpad that survives HMR), read it first, only create a new one if the slot is empty. **Three lines, infinite duplicates prevented.**"

**Issue 3: Worker died when the dev server died.**

> "I was testing with a bash command that had a 20-second timeout. The dev server got killed, which killed the worker, which orphaned in-flight jobs. Fix: I detached the dev server via `Start-Process cmd.exe /c "npm run dev"` so it survives the shell session. **For production, this is a real consideration** — serverless platforms like Vercel don't host long-running workers. You'd need a dedicated host (Railway, Fly.io) or split into Vercel Cron + worker."

### 2.8 What I'd Do Next (2 minutes)

Shows self-awareness and growth.

**In the next 2 weeks:**

- SSE streaming of pipeline progress (replaces polling)
- Real dashboard layout (sidebar, recommendation history, charts)
- PDF export of the daily briefing
- Alert system for anomalies (unusual sales drop, competitor price war)

**In the next 2 months:**

- Multi-cafe support (v1 is single-cafe)
- POS integration (auto-apply discounts) — this is the v1 "out of scope" item
- Sales history ingestion — currently I only use menu + weather
- Outcome tracking — did the discount actually work? — so the system can learn

**In the next 6 months:**

- Self-hosted LLM option (Ollama) for cafes with privacy requirements
- A/B testing framework for the strategist's prompts
- Production deployment decision: dedicated worker host vs. serverless

### 2.9 The Demo

If you can demo, **demo the Path C flow** — it's the most impressive.

```
1. Open localhost:3000
2. Click "Run Analysis"
3. Show the response: 202 + pipelineId
4. Show the polling: timeline of 5 agents lighting up
5. Show the final briefing: "Promote hot chocolate — it's cold and rainy"
6. Open Prisma Studio (or the DB) and show:
   - 5 AgentRun rows (one per agent)
   - 1 Recommendation row
   - N RecommendationAction rows
7. Optional: show the same job triggered by a cron — change the cron to "* * * * *" and watch it fire
```

**Don't demo:** the database schema, the package.json, the list of files. They don't care. Demo the *behavior*.

---

## 3. Common Interview Questions (with suggested answers)

### Q: "Walk me through the architecture."

Use the 3-worlds picture (Section 2.3). Spend 90 seconds. Don't go deeper unless they ask.

### Q: "Why did you use 5 agents?"

See Section 2.4. Land the three reasons: prompt quality, cost, explainability.

### Q: "What would happen if Groq went down?"

> "The orchestrator catches the error, writes it to `AgentRun.error`, and the job moves to BullMQ's `failed` list after retries. The user sees a friendly error: 'Groq is unreachable, here's what to try.' The cron job would also fail, but it would log and try again tomorrow. **No data corruption** because all writes are transactional."

### Q: "How do you prevent runaway costs from the LLM?"

> "Three safeguards. First, `MAX_REVISIONS = 1` caps the critic loop at one revision. Second, I use the cheap `llama-3.1-8b-instant` model for menu/weather analysis and only the expensive `llama-3.3-70b-versatile` for the strategist and critic. Third, every `generateObject` call has a `maxTokens` cap. Worst case per pipeline: ~5 calls × ~2k tokens = 10k tokens ≈ $0.01 on Groq."

### Q: "Why HTTP 202 instead of waiting for the result?"

> "Because the pipeline takes 30–60 seconds. If I waited, the request would hit most servers' 30-second timeout. The user would see a failed request even though the work succeeded. With 202, the user gets a `pipelineId` in 5ms and the system keeps working even if they close the tab."

### Q: "Why polling instead of SSE?"

> "Pragmatic. Polling works through every load balancer, proxy, and CDN. SSE adds connection state, which is harder to scale and debug. I noted in `progress.md` that SSE is a v2 improvement. The 1.5-second poll interval gives near-real-time UX with zero infra complexity."

### Q: "How do you handle a job that runs twice?"

> "The orchestrator is naturally idempotent — it creates a new `Recommendation` row per `pipelineId`. If a user double-clicks, two pipelines run, two rows exist, the user sees the latest. The `AgentRun` audit log is per-pipeline, so duplicate runs are visible, not hidden. **I never use `increment` or `update` in a job — always `upsert` or `create` with a unique key.**"

### Q: "What's the most interesting technical problem you solved?"

> "The HMR worker duplication. It was subtle — workers were silently duplicating on every save in dev, and I'd only notice when 5+ workers started fighting over the same job. The `globalThis` pattern is the standard Next.js solution but I'd never seen it explained. Once I understood it as 'a permanent scratchpad that survives resets,' it clicked. I documented the whole dukaan analogy in `context/LEARN.md`."

### Q: "If you had more time, what would you do first?"

> "SSE streaming. Polling works, but the user sees a flat 'analyzing...' for 30 seconds. With SSE, I'd stream the agent outputs as they happen — 'MenuAnalyst: 12 items categorized. WeatherAnalyst: cold, rainy...' — and the user feels the system is *thinking*, not stuck. It's a 2-day change and a huge UX win."

### Q: "Why Next.js 16 specifically?"

> "It's the current major version. I had to learn the new patterns: `instrumentation.ts` for boot, `RouteContext<'/path'>` for typed params, `await params` and `await cookies` everywhere. It's a learning investment that paid off — the new patterns are cleaner than the old ones."

### Q: "Why Prisma 7 specifically?"

> "Same answer — current version. The new driver-adapter requirement was a real constraint that changed how I structured `lib/db.ts`. The schema still works, but the client construction is different. I learned it the hard way (the error in `progress.md`) and now it's second nature."

### Q: "What was the hardest bug?"

Pick from Section 2.7. The Prisma 7 one is best because it shows version-upgrade adaptability. The HMR one is best because it shows framework-internals knowledge.

### Q: "How would you test this?"

> "Three layers. **Unit tests** on the orchestrator with mocked `generateObject` — fast, deterministic, no API calls. **Integration tests** with `scripts/test-pipeline.ts` — real Groq, real DB, end-to-end pipeline, asserts on the persisted `Recommendation` shape. **Manual smoke tests** for the UI — click the button, see the briefing. The gap is the orchestrator state machine itself; I'd write property-based tests ('no matter the inputs, the loop terminates within `MAX_REVISIONS` iterations') if I had more time."

### Q: "What did you learn?"

> "Three things. First, **LLM outputs are not deterministic** — even with temperature 0, the same prompt can give different JSON shapes. Zod validation isn't optional, it's the only thing keeping the next agent from receiving garbage. Second, **boilerplate is sometimes the right answer** — I almost wrote a custom queue, but BullMQ gave me retries, rate limits, persistence, and observability for 50 lines of code. Third, **boot order matters in Next.js** — workers must start in `instrumentation.ts`, not on first request, or the first user pays the boot cost."

---

## 4. The "Sound Bites" (memorize these 8 phrases)

1. "The workers don't care who enqueued. The queue is the great unifier."
2. "Routes return fast, workers do slow."
3. "Cron is a trigger, not a worker."
4. "Each agent has one job. Focused prompts beat big prompts."
5. "I use `generateObject`, not `generateText`. No string parsing, ever."
6. "The critic loop is bounded. Without a cap, agents can ping-pong forever and burn money."
7. "`globalThis` is the dukaan's diary — a permanent scratchpad that survives HMR."
8. "HTTP 202 means 'I accepted your request, the work is happening, come back later.'"

If you can drop these naturally during the interview, you sound like someone who's internalized the architecture, not memorized it.

---

## 5. The 3 Things to NEVER Say

1. **"I used X because that's what the tutorial showed."** Always have a reason. Even "I tried Y, it didn't fit because Z."
2. **"It's just a side project / not production."** Own it. Say "it's a v1" or "a working prototype" — never dismiss your own work.
3. **"I don't know how that works."** Better: "I'd have to look at the code, but my mental model is X. Want me to walk through it?" Admitting uncertainty while showing you have a model is way better than bluffing.

---

## 6. The Closing (use this verbatim if you run out of time)

> "So to wrap up: I built a multi-agent AI platform with a clear separation between the sync and async paths, used queues and cron to keep the API routes fast, and made the agent pipeline explainable and bounded. The hard parts weren't the LLM calls — they were the framework integration: Prisma 7's driver adapter, Next.js 16's boot hooks, and HMR-friendly workers. That's where the real engineering was. Happy to dive into any part."

That's your outro. Lands the project, names the real challenges, opens the door for follow-up questions.

---

## 7. Quick Self-Check Before the Interview

Can you answer these without looking at code? If not, re-read the relevant section.

- [ ] What does `instrumentation.ts` do, and why is it needed?
- [ ] Why does each agent use `generateObject` with a Zod schema?
- [ ] What does HTTP 202 mean, and why does this app use it?
- [ ] Why is the critic loop bounded?
- [ ] What problem does the `globalThis` pattern solve?
- [ ] Why is the cron function a trigger, not a worker?
- [ ] What are the 3 questions that decide which pattern to use?
- [ ] What would you change in v2?
- [ ] What's the most interesting bug you hit?

If all 9 are yes, you're ready.
