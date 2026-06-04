# Requirements

## Functional

### F1. Cafe configuration
- F1.1 Store cafe config: id, name, location (lat/lon or city), DB connection info
- F1.2 For v1, config is read from env / a local JSON file (no admin UI yet)

### F2. Menu ingestion
- F2.1 Connect to the cafe's DB using its stored credentials
- F2.2 Read the menu: items with name, category, price, optional description/tags
- F2.3 Support at minimum: PostgreSQL, SQLite, and a JSON-file mock (for dev)
- F2.4 Cache the menu in memory per request (no persistent cache in v1)

### F3. Weather retrieval
- F3.1 Fetch today's + tomorrow's forecast for the cafe's location
- F3.2 Use Open-Meteo (free, no API key) as the default provider
- F3.3 Return: temperature high/low, precipitation, condition (sunny/cloudy/rain/snow), wind

### F4. Multi-agent recommendation
- F4.1 Orchestrate the 5 agents in order: MenuAnalyst → WeatherAnalyst → Strategist → Critic → Synthesizer
- F4.2 Each agent's output is streamed to the UI in real time
- F4.3 Final output is a structured recommendation:
  - **Promote** (N items): name, reason
  - **Discount** (N items): name, suggested discount %, reason
  - **Hold** (N items): items that should not be touched today
  - **Confidence**: low / medium / high
  - **Reasoning summary**: 2–3 sentence explanation

### F5. UI
- F5.1 Home page: triggers a fresh analysis for the configured cafe
- F5.2 Sidebar: live agent activity (which agent is thinking, partial output)
- F5.3 Main panel: the final recommendation with per-item reasoning
- F5.4 Top bar: cafe name, weather summary, model selector, Groq status
- F5.5 Markdown rendering for agent outputs (headings, lists, bold, code blocks)

### F6. Streaming & control
- F6.1 Use NDJSON over HTTP (one JSON object per line)
- F6.2 Client can abort mid-stream; server stops calling Groq
- F6.3 Show errors clearly when Groq is unreachable, key is bad, or model missing

## Non-functional

### N1. Privacy
- All LLM inference goes through **Groq** (cloud). Menu data is sent to
  Groq for the duration of a request; we do not log it, and Groq is not
  used to train their models on our prompts by default.
- The LLM client is behind a small interface so we can swap providers
  (e.g. self-hosted Ollama) later without touching the rest of the app.
- The only third-party calls are: **Groq** (LLM) and the **weather provider**.

### N2. Performance
- First recommendation visible within ~2s of clicking (Planner + first agent streamed)
- Full run completes within 60s for typical menus (≤ 50 items)

### N3. Reliability
- If Groq is unreachable or returns an error, show a clear message with troubleshooting steps
- If a worker agent fails, the orchestrator retries once, then skips with a logged reason
- Critic loop is bounded to `MAX_REVISIONS` (default 2)

### N4. Observability
- Every agent call logs: agent name, duration, token count (from Groq), output length
- Logs go to stdout (visible in `next dev` console)

### N5. Code quality
- TypeScript strict mode, no `any` in committed code
- All agent prompts live in one place (`lib/agents/prompts.ts`) — easy to iterate
- No secrets in the client bundle; Groq API key and DB creds are server-only

## Open questions (to confirm)
- Q1: One cafe or many? — **Confirmed: one cafe**
- Q2: JSON file mock of the menu? — **Confirmed: yes**
- Q3: Weather provider? — **Confirmed: Open-Meteo**
- Q4: LLM provider? — **Confirmed: Groq (cloud), default `llama-3.1-8b-instant`**
