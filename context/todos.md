# TODO Roadmap

Ordered list of work. Each TODO has a detailed subtask file in
`subtasks/`. Do not start a new TODO until the previous one is approved.

- [ ] **TODO 1** — Greeter agent over the streaming pipeline
  *(proves Ollama + NDJSON end-to-end with one trivial agent)*
- [ ] **TODO 2** — Add the 5 real agents
  *(MenuAnalyst, WeatherAnalyst, Strategist, Critic, Synthesizer)*
- [ ] **TODO 3** — Wire the orchestrator
  *(Planner → Workers → Critic loop → Synthesizer)*
- [ ] **TODO 4** — Add tools to agents
  *(weather fetch, menu fetch — so agents stop working from raw context)*
- [ ] **TODO 5** — Add the menu DB source
  *(Postgres / SQLite / JSON mock behind a `MenuSource` interface)*
- [ ] **TODO 6** — Build the UI
  *(dashboard + agent activity sidebar, shadcn-based)*
- [ ] **TODO 7** — Polish
  *(typed errors, logger, env config, README, lint pass)*
