# TODO 1 — Greeter agent over the streaming pipeline

## Goal
Stand up the **minimum end-to-end pipeline** that lets one agent talk to
Groq and stream its response back over HTTP as NDJSON. No UI, no
orchestrator, no real prompts — just the wire working.

## Scope
In scope:
- A server-only Groq client that streams chat completions.
- A typed event protocol for what we send down the wire.
- A single `/api/chat` route handler that runs one "Greeter" agent.
- A `curl`-able test that proves streaming works.

Out of scope (later TODOs):
- Multiple agents, orchestrator, planner, critic loop.
- Tools, DB, weather, UI.

## Files to create

| Path | Purpose |
| --- | --- |
| `lib/agents/prompts.ts` | System prompt for the `Greeter` agent |
| `app/api/chat/route.ts` | `POST` handler — uses Vercel AI SDK's `streamText` + `groq()` and returns `toUIMessageStreamResponse()` |
| `package.json` | New deps: `ai`, `@ai-sdk/groq` |
| `.env.local` | `GROQ_API_KEY`, `GROQ_MODEL=llama-3.1-8b-instant`, `MAX_TOKENS=512` |

## Dependencies

| Package | Why |
| --- | --- |
| `ai` | Vercel AI SDK core — `streamText`, `tool()`, multi-step helpers |
| `@ai-sdk/groq` | Groq provider for the AI SDK (OpenAI-compatible under the hood) |

> Removed: hand-rolled `lib/groq.ts` is gone. The AI SDK handles fetch,
> SSE parsing, and abort signals internally.

## Behavior

`POST /api/chat` accepts a `UIMessage[]` body (the shape used by the AI SDK's
`useChat` hook on the client) and streams back a **UI Message Stream** (the
SDK's native SSE-style protocol — `data: {json}\n\n` lines) via
`result.toUIMessageStreamResponse()`.

Body shape:
```json
{
  "messages": [
    { "id": "1", "role": "user", "parts": [{ "type": "text", "text": "Hi, I am Alex" }] }
  ]
}
```

The Greeter agent's job is to **greet the user by name if they give one,
otherwise say hello cheerfully**. The prompt is hand-written in
`lib/agents/prompts.ts` — kept small on purpose.

## Acceptance criteria
1. `npm run dev` runs without TS / lint errors.
2. `curl -N -X POST http://localhost:3000/api/chat -H 'content-type: application/json' -d '{"messages":[{"id":"1","role":"user","parts":[{"type":"text","text":"Hi, I am Alex"}]}]}'` returns a UI Message Stream (SSE `data:` lines) ending with a `finish` part.
3. A bad/missing `GROQ_API_KEY` surfaces as a 5xx (the SDK throws before the stream starts).
4. Sending a request and then closing the client cancels the upstream call via `req.signal` (no further chunks after disconnect).
5. `GROQ_MODEL` and `MAX_TOKENS` are read from `.env.local`.

## Why UI Message Stream (not NDJSON) here
- It is the Vercel AI SDK's native streaming protocol — works out of the box
  with `useChat` on the client (TODO 6 wires the UI).
- TODO 3 (orchestrator) will need to **multiplex** MenuAnalyst +
  WeatherAnalyst + Strategist + Critic + Synthesizer through one HTTP
  connection. At that point we will wrap the SDK's `toUIMessageStream()`
  per agent in a per-line NDJSON envelope on the orchestrator's
  `/api/recommend` route (the `AgentEvent` shape from earlier drafts is
  reintroduced there, not here). F6.1 (NDJSON) is satisfied at the
  orchestrator level, not at the single-agent greeter level.

## How to test
1. Put your Groq key in `.env.local`:
   ```
   GROQ_API_KEY=...
   GROQ_MODEL=llama-3.1-8b-instant
   MAX_TOKENS=512
   ```
2. `npm run dev`.
3. From a second terminal:
   `curl -N -X POST http://localhost:3000/api/chat -H 'content-type: application/json' -d '{"messages":[{"id":"1","role":"user","parts":[{"type":"text","text":"Hi, I am Alex"}]}]}'`
4. Watch `data:` SSE lines arrive one by one.

## Notes / decisions
- LLM client: **Vercel AI SDK** (`ai` + `@ai-sdk/groq`). Route uses
  `streamText` and returns `result.toUIMessageStreamResponse()` — the SDK
  handles fetch, SSE framing, and abort signals internally. No custom
  event types, no async generator, no manual NDJSON encoding in this TODO.
- The SDK reads `GROQ_API_KEY` from env automatically. We never touch the
  key in our code.
- No retries in this TODO — TODO 3 (orchestrator) adds them.
- No UI in this TODO — that's TODO 6. We test with `curl`.
- Tools (weather, menu) come in TODO 4 via the SDK's `tool()` helper.
