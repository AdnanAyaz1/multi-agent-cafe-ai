# Data Model

> Status: **Active.** Prisma schema in `prisma/schema.prisma` is the source of truth.
> Migrations in `prisma/migrations/`.

## Models

| Model | Purpose |
|---|---|
| `Business` | A subscribed cafe/restaurant/ecommerce store. Holds location + flexible `config` JSON. |
| `DataSnapshot` | Time-stamped payload from any data source (weather, sales, competitors, trends). 24h TTL on weather. |
| `Recommendation` | AI-generated action for a business on a given day. Tracks status (pending → applied → outcome). |
| `RecommendationAction` | One concrete action within a recommendation (e.g. "discount Hot Chocolate 15%"). |
| `Alert` | First-class notification (anomaly, competitor, weather, sales). Has severity + read state. |
| `AgentRun` | Log entry for a single agent invocation. `pipelineId` groups all 4 agents of one analysis cycle. |
| `JobSchedule` | Cron config (expression, enabled flag, last/next run, job-specific config). |

## Relationships

```
Business (1) ──< (N) DataSnapshot
Business (1) ──< (N) Recommendation
Business (1) ──< (N) Alert
Recommendation (1) ──< (N) RecommendationAction
AgentRun (standalone)   ← grouped by pipelineId, not by FK
JobSchedule (standalone) ← referenced by name from the scheduler
```

## Indexes

- `DataSnapshot`: `(businessId, source, collectedAt)` — fast latest-snapshot lookups per source
- `Recommendation`: `(businessId, date)` + `(businessId, status)` — dashboard list + filter
- `Alert`: `(businessId, read, createdAt)` — unread badge query
- `AgentRun`: `pipelineId` + `(agentName, createdAt)` — per-cycle + per-agent timelines

## Open items

- `Business.config` is `Json?` — schema per business type is documented in code, not enforced in DB. Acceptable for v1; consider a typed config in v2.
- `AgentRun.pipelineId` is a `String` (not a FK) — cycles are ephemeral, no need for a `Pipeline` table yet.
