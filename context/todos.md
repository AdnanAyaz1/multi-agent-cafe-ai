# TODO Roadmap

> Living checklist. Updated as work completes. Detailed notes in `subtasks/`.

## Master TODOs

- [x] **TODO 0** — Foundation: deps, Docker (Redis), Prisma schema, singletons, BullMQ scaffold, instrumentation boot
- [x] **TODO 1** — Greeter agent — *skipped* (current `weather-agent` validates the same patterns; the Greeter was a placeholder for proving Groq + tools + streaming, which the weather flow already does)
- [x] **TODO 2** — Weather worker end-to-end (real `fetchWeather` + Prisma snapshot + cron schedule)
- [x] **TODO 2b** — API hardening: Zod validation + custom error classes (the `apiHandler` wrapper was *removed* later — see `flow-walkthrough.md` step 4 explainer; inlined try/catch + Next.js 16 `RouteContext` is the new pattern)
- [ ] **TODO 3** — Sales data ingestion (mock + DB pattern)
- [ ] **TODO 4** — Competitor scraping (Cheerio) — *deferred* per user
- [ ] **TODO 5** — Customer trend analysis — *deferred* per user
- [x] **TODO 6** — Data Analyzer agent → built as **Menu Analyst** + **Weather Analyst** (two parallel analysis agents, validated by Zod via `generateObject`)
- [x] **TODO 7** — Recommender agent → built as **Strategist** (accepts critic feedback, re-runs inside the orchestrator's revision loop)
- [x] **TODO 8** — Critic agent → built as **Critic** (exports `criticHasBlockers/Warnings` for the orchestrator to decide whether to loop)
- [x] **TODO 9** — Briefing Writer agent → built as **Synthesizer** (final brief + action list; exports `deriveFinalConfidence`)
- [x] **TODO 10** — Pipeline orchestrator → built as `lib/agents/orchestrator.ts` with bounded critic revision loop, full `Recommendation` + `RecommendationAction[]` persistence, `AgentRun` audit log per LLM call
- [x] **TODO 12** — Polish (partial): structured `lib/logger.ts`; `lib/errors.ts`; lint + tsc clean; `.env.example` updated. Still missing: README, agent-layer typed errors (currently using strings in `AgentRun.error`)
- [ ] **TODO 11** — Dashboard UI polish: shadcn: briefings, recommendations, alerts, charts. *Minimal version* shipped today: `components/dashboard/AnalysisPanel.tsx` (button → polling → agent timeline + briefing + action list). Full sidebar / history / charts still pending.

## Recent completions

- **2026-06-04** — TODO 0, 1 (skipped), 2, 2b. Weather worker + API live. See `progress.md`.
- **2026-06-04 (later)** — TODO 6, 7, 8, 9, 10 shipped. Full **5-agent analysis pipeline** end-to-end:
  - `lib/agents/{types,prompts,models,run}.ts` + 5 agent files + `orchestrator.ts`
  - `lib/workers/analysis-worker.ts` (BullMQ, concurrency 2, rate-limited)
  - `app/api/analysis/run/route.ts` (POST → 202 + `pipelineId`)
  - `app/api/analysis/[pipelineId]/route.ts` (GET → status + AgentRun timeline + Recommendation)
  - `hooks/useAnalysis.ts` + `components/dashboard/AnalysisPanel.tsx` (poll, 1.5s interval, 5min cap)
  - `scripts/test-pipeline.ts` (E2E test)
  - `context/flow-walkthrough.md` updated with full **Path C** section (dukaan / 5-consultants analogy, ASCII diagram, production-grade touches table, run-it-yourself commands)
