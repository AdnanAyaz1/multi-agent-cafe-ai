# TODO Roadmap

> Living checklist. Updated as work completes. Detailed notes in `subtasks/`.

## Master TODOs

- [x] **TODO 0** — Foundation: deps, Docker (Redis), Prisma schema, singletons, BullMQ scaffold, instrumentation boot
- [x] **TODO 1** — Greeter agent — *skipped* (current `weather-agent` validates the same patterns; the Greeter was a placeholder for proving Groq + tools + streaming, which the weather flow already does)
- [x] **TODO 2** — Weather worker end-to-end (real `fetchWeather` + Prisma snapshot + cron schedule)
- [x] **TODO 2b** — API hardening: Zod validation + custom error classes + `apiHandler` wrapper
- [ ] **TODO 3** — Sales data ingestion (mock + DB pattern)
- [ ] **TODO 4** — Competitor scraping (Cheerio)
- [ ] **TODO 5** — Customer trend analysis
- [ ] **TODO 6** — Data Analyzer agent (first of the 4-agent pipeline)
- [ ] **TODO 7** — Recommender agent
- [ ] **TODO 8** — Critic agent
- [ ] **TODO 9** — Briefing Writer agent
- [ ] **TODO 10** — Pipeline orchestrator
- [ ] **TODO 11** — Dashboard UI (shadcn: briefings, recommendations, alerts, charts)
- [ ] **TODO 12** — Polish: typed errors on agent layer, logger, README, lint pass

## Recent completions

- **2026-06-04** — TODO 0, 1 (skipped), 2, 2b. See `progress.md` for dry run + decisions.
