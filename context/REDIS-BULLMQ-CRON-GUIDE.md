# Redis, BullMQ & Cron Jobs — Dry Run Guide

This document explains how these three technologies work together in our app,
using plain language and step-by-step examples.

---

## 1. Redis — The Fast Memory Bank

### What is it?
Redis is a **key-value store that lives in RAM**. Think of it as a super-fast
dictionary that persists to disk. It's 100x faster than PostgreSQL for simple
reads/writes because it doesn't touch disk for most operations.

### Core concept: Keys → Values

```
SET cafe:weather:london '{"temp": 18, "condition": "Rainy"}'
GET cafe:weather:london
→ '{"temp": 18, "condition": "Rainy"}'
```

### Real examples in our app

**Example 1: Caching weather data**

```
# Without Redis (slow):
API Request → Open-Meteo API (500ms) → Return to user

# With Redis (fast after first call):
API Request → Redis cache (1ms) → Return to user
             ↓ (if cache miss)
             Open-Meteo API (500ms) → Save to Redis → Return to user
```

**Example 2: What Redis stores for us**

```
Key: business:abc123:weather
Value: {
  "city": "London",
  "temperature": 18,
  "condition": "Rainy",
  "collectedAt": "2026-06-04T09:00:00Z"
}
TTL: 3600 seconds (auto-deletes after 1 hour)

Key: business:abc123:menu
Value: [
  { "name": "Hot Chocolate", "price": 4.50, "category": "drinks" },
  { "name": "Iced Latte", "price": 5.00, "category": "drinks" }
]
TTL: 86400 seconds (auto-deletes after 24 hours)
```

**Example 3: Rate limiting**

```
# Track API calls per user
INCR rate_limit:user123          → 1
INCR rate_limit:user123          → 2
INCR rate_limit:user123          → 3
EXPIRE rate_limit:user123 60     → expires in 60 seconds

# Check before allowing request
GET rate_limit:user123
→ If > 100, reject with "Too many requests"
```

---

## 2. Cron Jobs — The Clock That Triggers Things

### What is it?
Cron is a **time-based job scheduler**. You tell it "run this function every
day at 6am" and it does exactly that.

### Cron syntax: `minute hour day month weekday`

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-7, 0=7=Sun)
│ │ │ │ │
* * * * *
```

### Common patterns

```
"0 6 * * *"     → Every day at 6:00 AM
"0 9 * * 1-5"   → Every weekday at 9:00 AM
"*/15 * * * *"  → Every 15 minutes
"0 0 1 * *"     → First day of every month at midnight
"30 8 * * 1"    → Every Monday at 8:30 AM
```

### Real examples in our app

```typescript
// lib/scheduler.ts
import cron from 'node-cron';

export function startScheduler() {
  // 1. Fetch weather at 6am daily
  cron.schedule('0 6 * * *', async () => {
    console.log('6am: Fetching weather for all cafes...');
    const cafes = await prisma.business.findMany();
    for (const cafe of cafes) {
      await dataCollectQueue.add('weather-fetch', {
        businessId: cafe.id,
        city: cafe.city,
      });
    }
  });

  // 2. Run AI analysis at 9am daily
  cron.schedule('0 9 * * *', async () => {
    console.log('9am: Running AI analysis...');
    // ... queue AI jobs
  });

  // 3. Clean up old data at 2am daily
  cron.schedule('0 2 * * *', async () => {
    console.log('2am: Cleaning up old data...');
    // ... delete old records
  });
}
```

### Timeline of a typical day

```
06:00 AM → cron fires "weather-fetch"
           → Adds job to BullMQ queue
           → Worker fetches weather from Open-Meteo
           → Stores in PostgreSQL

07:00 AM → cron fires "sales-pull"
           → Adds job to BullMQ queue
           → Worker pulls yesterday's sales from DB

08:00 AM → cron fires "competitor-scrape"
           → Adds job to BullMQ queue
           → Worker scrapes competitor websites

09:00 AM → cron fires "daily-analysis"
           → Adds job to BullMQ queue
           → Worker runs 4 AI agents in sequence
           → Stores recommendations in DB

09:30 AM → cron fires "briefing-send"
           → Generates daily briefing PDF
           → Sends to cafe owner
```

---

## 3. BullMQ — The Smart Job Queue

### What is it?
BullMQ is a **job queue built on Redis**. It handles:
- **Reliability**: Jobs persist in Redis, survive crashes
- **Retries**: Failed jobs auto-retry with backoff
- **Rate limiting**: Don't overwhelm APIs
- **Priority**: Important jobs run first
- **Concurrency**: Multiple workers process jobs in parallel

### Core concept: Producer → Queue → Worker

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Producer   │ ──→ │    Queue    │ ──→ │   Worker    │
│ (adds jobs) │     │ (stores in  │     │ (processes  │
│             │     │   Redis)    │     │   jobs)     │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Step-by-step dry run

**Step 1: Producer adds a job**

```typescript
// lib/queues/data-queue.ts
import { Queue } from 'bullmq';

const dataCollectQueue = new Queue('data-collect', {
  connection: { host: 'localhost', port: 6379 },
});

// This is the PRODUCER side
// A cron job or API route calls this to add work
await dataCollectQueue.add('weather-fetch', {
  businessId: 'abc-123',
  city: 'London',
  latitude: 51.5074,
  longitude: -0.1278,
}, {
  priority: 1,        // Higher priority
  attempts: 3,        // Retry up to 3 times
  backoff: {
    type: 'exponential',
    delay: 2000,      // Wait 2s, then 4s, then 8s
  },
});
```

**What happens internally:**

```
Redis receives:
LPUSH bull:data-collect:waiting '{
  "id": "job_abc123",
  "name": "weather-fetch",
  "data": {
    "businessId": "abc-123",
    "city": "London",
    "latitude": 51.5074,
    "longitude": -0.1278
  },
  "opts": {
    "priority": 1,
    "attempts": 3
  },
  "timestamp": 1717507200000
}'

Redis List state:
bull:data-collect:waiting = [job_abc123]
bull:data-collect:active = []
bull:data-collect:completed = []
```

**Step 2: Worker picks up the job**

```typescript
// lib/workers/weather-worker.ts
import { Worker, Job } from 'bullmq';

const weatherWorker = new Worker(
  'data-collect',           // Must match queue name
  async (job: Job) => {
    // This function runs when a job is available
    console.log(`Processing weather for ${job.data.city}`);

    // Do the actual work
    const weather = await fetchWeather(job.data.city);

    // Store in database
    await prisma.dataSnapshot.create({
      data: {
        businessId: job.data.businessId,
        source: 'weather',
        data: weather,
      },
    });

    // Return result (stored in Redis)
    return { success: true, temperature: weather.temperature };
  },
  {
    connection: { host: 'localhost', port: 6379 },
    concurrency: 5,        // Process 5 jobs at once
    limiter: {
      max: 10,             // Max 10 jobs
      duration: 60_000,    // Per 60 seconds
    },
  }
);
```

**What happens internally:**

```
1. Worker polls Redis: BRPOP bull:data-collect:active
2. Redis returns: job_abc123
3. Worker moves job to "active" list:
   LRANGE bull:data-collect:waiting 0 -1  → [job_abc123]
   LREM bull:data-collect:waiting 1 job_abc123
   LPUSH bull:data-collect:active job_abc123

4. Worker executes the function
5. On success:
   LREM bull:data-collect:active 1 job_abc123
   LPUSH bull:data-collect:completed job_abc123

6. On failure:
   LREM bull:data-collect:active 1 job_abc123
   INCR bull:data-collect:job_abc123:attempts → 1
   If attempts < 3:
     LPUSH bull:data-collect:waiting job_abc123  (retry)
   Else:
     LPUSH bull:data-collect:failed job_abc123
```

**Step 3: Worker events (monitoring)**

```typescript
weatherWorker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
  // Output: Job job_abc123 completed: { success: true, temperature: 18 }
});

weatherWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
  // Output: Job job_abc123 failed: City "London" not found
});

weatherWorker.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
  // Output: Job job_abc123 progress: 50%
});
```

---

## 4. How They Work Together — Full Dry Run

### Scenario: Daily weather fetch for 3 cafes

```
┌─────────────────────────────────────────────────────────────────┐
│                     TIMELINE                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  6:00:00 AM                                                      │
│  ┌──────────────────┐                                            │
│  │  node-cron fires │                                            │
│  └────────┬─────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │  Query DB:       │                                            │
│  │  SELECT * FROM   │                                            │
│  │  businesses      │  → Returns 3 cafes:                       │
│  └────────┬─────────┘    1. Cafe A (London)                     │
│           │              2. Cafe B (Paris)                       │
│           │              3. Cafe C (New York)                    │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │  Add 3 jobs to   │                                            │
│  │  BullMQ queue    │                                            │
│  └────────┬─────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐     ┌──────────────────┐                   │
│  │  Queue in Redis  │     │  Worker picks up │                   │
│  │  ┌─────────────┐ │ ──→ │  Job 1 (London)  │                   │
│  │  │ Job 1       │ │     └────────┬─────────┘                   │
│  │  │ Job 2       │ │              │                             │
│  │  │ Job 3       │ │              ▼                             │
│  │  └─────────────┘ │     ┌──────────────────┐                   │
│  └──────────────────┘     │  Open-Meteo API  │                   │
│                           │  GET /forecast?  │                   │
│                           │  lat=51.5074     │                   │
│                           │  lon=-0.1278     │                   │
│                           └────────┬─────────┘                   │
│                                    │                             │
│                                    ▼                             │
│                           ┌──────────────────┐                   │
│                           │  Response:       │                   │
│                           │  { temp: 18,     │                   │
│                           │    rain: true }  │                   │
│                           └────────┬─────────┘                   │
│                                    │                             │
│                                    ▼                             │
│                           ┌──────────────────┐                   │
│                           │  Store in DB:    │                   │
│                           │  INSERT INTO     │                   │
│                           │  data_snapshots  │                   │
│                           │  (businessId,    │                   │
│                           │   source, data)  │                   │
│                           └────────┬─────────┘                   │
│                                    │                             │
│                                    ▼                             │
│                           ┌──────────────────┐                   │
│                           │  Job completed!  │                   │
│                           │  Store result in │                   │
│                           │  Redis cache     │                   │
│                           └──────────────────┘                   │
│                                                                  │
│  6:00:02 AM  (2 seconds later)                                   │
│  ┌──────────────────┐                                            │
│  │  Worker picks up │                                            │
│  │  Job 2 (Paris)   │  → Same process                            │
│  └──────────────────┘                                            │
│                                                                  │
│  6:00:04 AM                                                      │
│  ┌──────────────────┐                                            │
│  │  Worker picks up │                                            │
│  │  Job 3 (NYC)     │  → Same process                            │
│  └──────────────────┘                                            │
│                                                                  │
│  6:00:06 AM                                                      │
│  ┌──────────────────┐                                            │
│  │  All 3 jobs done │                                            │
│  │  Queue is empty  │                                            │
│  └──────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### What if a job fails?

```
Job 2 (Paris) fails: "API timeout"

Attempt 1:
  → Worker tries to fetch weather
  → Open-Meteo API doesn't respond in 5 seconds
  → Error: "TimeoutError: Request timed out"
  → Job marked as failed
  → BullMQ checks: attempts (1) < maxAttempts (3)
  → Job re-queued with delay: 2000ms (exponential backoff)

Attempt 2 (2 seconds later):
  → Worker tries again
  → Open-Meteo API responds this time
  → Success! Job completed

Final state in Redis:
  bull:data-collect:completed = [job_abc123, job_xyz789]
  bull:data-collect:failed = []
```

---

## 5. Our App's Queue Architecture

### Queue 1: Data Collection (Priority 1 — Highest)

```
┌─────────────────────────────────────────────────────────────┐
│  Queue: data-collect                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Job Types:                                                  │
│  ┌─────────────────┬──────────┬───────────┬──────────────┐  │
│  │ Job Name        │ Cron     │ Worker    │ What it does │  │
│  ├─────────────────┼──────────┼───────────┼──────────────┤  │
│  │ weather-fetch   │ 6am      │ weather   │ Fetch from   │  │
│  │                 │          │ worker    │ Open-Meteo   │  │
│  ├─────────────────┼──────────┼───────────┼──────────────┤  │
│  │ sales-pull      │ 7am      │ sales     │ Pull from    │  │
│  │                 │          │ worker    │ business DB  │  │
│  ├─────────────────┼──────────┼───────────┼──────────────┤  │
│  │ competitor-     │ 8am      │ compet.   │ Scrape       │  │
│  │ scrape          │          │ worker    │ websites     │  │
│  ├─────────────────┼──────────┼───────────┼──────────────┤  │
│  │ trend-analysis  │ 8am      │ trend     │ Analyze      │  │
│  │                 │          │ worker    │ order data   │  │
│  └─────────────────┴──────────┴───────────┴──────────────┘  │
│                                                              │
│  Rate Limit: 10 jobs per 60 seconds                         │
│  Retry: 3 attempts, exponential backoff                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Queue 2: AI Analysis (Priority 2)

```
┌─────────────────────────────────────────────────────────────┐
│  Queue: ai-analysis                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Job Types:                                                  │
│  ┌─────────────────┬──────────┬───────────┬──────────────┐  │
│  │ Job Name        │ Cron     │ Worker    │ What it does │  │
│  ├─────────────────┼──────────┼───────────┼──────────────┤  │
│  │ daily-analysis  │ 9am      │ analysis  │ Run 4 AI     │  │
│  │                 │          │ worker    │ agents       │  │
│  ├─────────────────┼──────────┼───────────┼──────────────┤  │
│  │ on-demand       │ manual   │ analysis  │ User clicks  │  │
│  │                 │          │ worker    │ "Run Now"    │  │
│  └─────────────────┴──────────┴───────────┴──────────────┘  │
│                                                              │
│  Retry: 2 attempts (AI calls are expensive)                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Queue 3: Reports (Priority 3)

```
┌─────────────────────────────────────────────────────────────┐
│  Queue: reports                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Job Types:                                                  │
│  ┌─────────────────┬──────────┬───────────┬──────────────┐  │
│  │ Job Name        │ Cron     │ Worker    │ What it does │  │
│  ├─────────────────┼──────────┼───────────┼──────────────┤  │
│  │ briefing-send   │ 9:30am   │ report    │ Generate PDF │  │
│  │                 │          │ worker    │ & email      │  │
│  └─────────────────┴──────────┴───────────┴──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Code Examples — How We Use Each

### Example 1: Cron triggers BullMQ

```typescript
// lib/scheduler.ts
import cron from 'node-cron';
import { dataCollectQueue } from './queues/data-queue';
import { prisma } from './db';

export function startScheduler() {
  // Cron fires → adds job to BullMQ → Worker processes it
  cron.schedule('0 6 * * *', async () => {
    const businesses = await prisma.business.findMany();

    for (const biz of businesses) {
      // This ADDS a job to the queue, doesn't run it
      await dataCollectQueue.add('weather-fetch', {
        businessId: biz.id,
        city: biz.city,
        latitude: biz.latitude,
        longitude: biz.longitude,
      });
    }
  });
}
```

### Example 2: Worker processes jobs

```typescript
// lib/workers/weather-worker.ts
import { Worker, Job } from 'bullmq';
import { fetchWeather } from '@/lib/services/weather/client';
import { prisma } from '@/lib/db';

// This RUNS when a job is available
export const weatherWorker = new Worker(
  'data-collect',
  async (job: Job) => {
    const { businessId, city } = job.data;

    // Update progress (optional, for UI feedback)
    await job.updateProgress(10);

    // Do the actual work
    const weather = await fetchWeather(city);

    await job.updateProgress(50);

    // Store result
    await prisma.dataSnapshot.create({
      data: {
        businessId,
        source: 'weather',
        data: weather,
      },
    });

    await job.updateProgress(100);

    return { success: true, city, temperature: weather.temperature };
  },
  { connection: { host: 'localhost', port: 6379 } }
);
```

### Example 3: API route triggers on-demand job

```typescript
// app/api/analysis/run/route.ts
import { NextResponse } from 'next/server';
import { aiAnalysisQueue } from '@/lib/queues/data-queue';

export async function POST() {
  // User clicks "Run Analysis Now" button
  // This adds a job to the AI analysis queue

  const job = await aiAnalysisQueue.add('daily-analysis', {
    businessId: 'abc-123',
    onDemand: true,
  });

  return NextResponse.json({
    jobId: job.id,
    message: 'Analysis started',
  });
}
```

### Example 4: SSE stream shows job progress

```typescript
// app/api/analysis/[jobId]/stream/route.ts
export async function GET(req, { params }) {
  const stream = new ReadableStream({
    async start(controller) {
      const worker = new Worker('ai-analysis', async (job) => {
        // Send progress events to client
        controller.enqueue(
          `data: ${JSON.stringify({ progress: job.progress })}\n\n`
        );
      });

      // Wait for job to complete
      const result = await job.waitUntilFinished();
      controller.enqueue(
        `data: ${JSON.stringify({ done: true, result })}\n\n`
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

---

## 7. Visual Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                        OUR APP ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    CRON SCHEDULER                        │    │
│  │  node-cron runs on app start                            │    │
│  │                                                          │    │
│  │  6am → "Fetch weather"                                   │    │
│  │  7am → "Pull sales"                                      │    │
│  │  8am → "Scrape competitors"                              │    │
│  │  9am → "Run AI analysis"                                 │    │
│  │  9:30am → "Send briefing"                                │    │
│  └──────────────────────┬──────────────────────────────────┘    │
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     BULLMQ QUEUES                        │    │
│  │  (Stored in Redis)                                       │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │ data-collect │  │ ai-analysis  │  │   reports    │  │    │
│  │  │   Priority 1 │  │   Priority 2 │  │   Priority 3 │  │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │    │
│  │         │                 │                 │            │    │
│  └─────────┼─────────────────┼─────────────────┼────────────┘    │
│            │                 │                 │                  │
│            ▼                 ▼                 ▼                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                       WORKERS                            │    │
│  │  (Run in background, process jobs)                       │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │   Weather    │  │   Analysis   │  │   Report     │  │    │
│  │  │   Worker     │  │   Worker     │  │   Worker     │  │    │
│  │  │              │  │              │  │              │  │    │
│  │  │ - Fetch API  │  │ - Run 4 AI   │  │ - Generate   │  │    │
│  │  │ - Store DB   │  │   agents     │  │   PDF        │  │    │
│  │  │ - Update     │  │ - Store recs │  │ - Send email │  │    │
│  │  │   Redis      │  │              │  │              │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │    │
│  │                                                          │    │
│  └──────────────────────┬──────────────────────────────────┘    │
│                         │                                        │
│                         ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    EXTERNAL SERVICES                     │    │
│  │                                                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │  Open-Meteo  │  │   Groq API   │  │  PostgreSQL  │  │    │
│  │  │  (Weather)   │  │   (LLM)      │  │  (Database)  │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Key Takeaways

| Concept | What it does | In our app |
|---------|--------------|------------|
| **Redis** | Fast key-value store | Caches weather, queues jobs, stores session data |
| **Cron** | Time-based triggers | Runs jobs at 6am, 7am, 8am, 9am daily |
| **BullMQ** | Reliable job queue | Handles retries, rate limits, priorities |
| **Worker** | Processes jobs | Fetches weather, runs AI, generates reports |

### The flow:
1. **Cron** fires at scheduled time
2. **Cron** adds job to **BullMQ** queue
3. **BullMQ** stores job in **Redis**
4. **Worker** picks up job from queue
5. **Worker** processes (API call, DB write, etc.)
6. **Worker** stores result in **Redis** cache
7. **Worker** marks job as complete

### Why not just run the code directly?

```
# Without BullMQ (bad):
cron.schedule('0 6 * * *', async () => {
  await fetchWeather(); // What if this fails?
  // No retry, no logging, no rate limiting
});

# With BullMQ (good):
cron.schedule('0 6 * * *', async () => {
  await dataCollectQueue.add('weather-fetch', data);
  // BullMQ handles: retries, logging, rate limits, monitoring
});
```

---

## 9. Without Redis/BullMQ — The Simple Approach

You can build the same app without Redis or BullMQ. Here's how.

### 9.1 Cron: Keep It (No Change)

`node-cron` works standalone — it doesn't need Redis. Keep using it.

```typescript
// lib/scheduler.ts — Works without Redis
import cron from 'node-cron';

export function startScheduler() {
  // This still works fine
  cron.schedule('0 6 * * *', async () => {
    await fetchWeatherForAllCafes();
  });
}
```

### 9.2 Replace BullMQ: Direct Function Calls

Instead of adding jobs to a queue, just call the function directly.

```
WITH BullMQ:
  Cron → Queue → Worker → Process → Store

WITHOUT BullMQ:
  Cron → Process → Store
```

**Code comparison:**

```typescript
// ═══════════════════════════════════════════════════════════════
// WITH BULLMQ (Production)
// ═══════════════════════════════════════════════════════════════
import { dataCollectQueue } from './queues/data-queue';

cron.schedule('0 6 * * *', async () => {
  const cafes = await prisma.business.findMany();
  for (const cafe of cafes) {
    await dataCollectQueue.add('weather-fetch', {
      businessId: cafe.id,
      city: cafe.city,
    });
  }
});

// Worker picks up later
const weatherWorker = new Worker('data-collect', async (job) => {
  const weather = await fetchWeather(job.data.city);
  await prisma.dataSnapshot.create({ data: weather });
});

// ═══════════════════════════════════════════════════════════════
// WITHOUT BULLMQ (Simple)
// ═══════════════════════════════════════════════════════════════
cron.schedule('0 6 * * *', async () => {
  const cafes = await prisma.business.findMany();
  for (const cafe of cafes) {
    try {
      const weather = await fetchWeather(cafe.city);
      await prisma.dataSnapshot.create({
        data: { businessId: cafe.id, source: 'weather', data: weather },
      });
    } catch (error) {
      console.error(`Failed to fetch weather for ${cafe.city}:`, error);
      // No automatic retry — you'd have to implement it yourself
    }
  }
});
```

### 9.3 Replace Redis Cache: PostgreSQL or In-Memory

**Option A: Use PostgreSQL as cache (simple, slower)**

```typescript
// lib/cache.ts — Database-based cache
import { prisma } from '@/lib/db';

export async function getCachedWeather(city: string) {
  // Check if we have recent weather data (< 1 hour old)
  const cached = await prisma.dataSnapshot.findFirst({
    where: {
      source: 'weather',
      collectedAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
    orderBy: { collectedAt: 'desc' },
  });

  if (cached) {
    return cached.data; // Return cached data
  }

  // Cache miss — fetch fresh data
  const fresh = await fetchWeather(city);

  // Store in database (acts as cache)
  await prisma.dataSnapshot.create({
    data: {
      businessId: 'current',
      source: 'weather',
      data: fresh,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour TTL
    },
  });

  return fresh;
}
```

**Option B: In-memory cache (fast, lost on restart)**

```typescript
// lib/cache.ts — In-memory cache
const cache = new Map<string, { data: unknown; expiresAt: number }>();

export function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data as T;
}

export function setCache(key: string, data: unknown, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// Usage
const cached = getCached('weather:london');
if (cached) return cached;

const fresh = await fetchWeather('london');
setCache('weather:london', fresh, 60 * 60 * 1000); // 1 hour
return fresh;
```

### 9.4 Implement Retry Logic Yourself

```typescript
// lib/retry.ts — Manual retry utility
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { attempts: number; delayMs: number } = { attempts: 3, delayMs: 2000 }
): Promise<T> {
  for (let attempt = 1; attempt <= options.attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === options.attempts) throw error;

      const waitMs = options.delayMs * Math.pow(2, attempt - 1); // Exponential backoff
      console.log(`Attempt ${attempt} failed, retrying in ${waitMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }
  throw new Error('Unreachable');
}

// Usage
await withRetry(async () => {
  const weather = await fetchWeather('london');
  await prisma.dataSnapshot.create({ data: weather });
}, { attempts: 3, delayMs: 2000 });
```

### 9.5 Simple In-Memory Job Queue (No Redis)

```typescript
// lib/simple-queue.ts — No Redis needed
type JobHandler<T> = (data: T) => Promise<void>;

interface Job<T> {
  id: string;
  name: string;
  data: T;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
}

class SimpleQueue {
  private jobs: Job<unknown>[] = [];
  private handlers = new Map<string, JobHandler<unknown>>();

  register<T>(name: string, handler: JobHandler<T>) {
    this.handlers.set(name, handler as JobHandler<unknown>);
  }

  async add<T>(name: string, data: T, options?: { attempts?: number }) {
    const job: Job<T> = {
      id: crypto.randomUUID(),
      name,
      data,
      status: 'pending',
      attempts: 0,
      maxAttempts: options?.attempts ?? 3,
    };
    this.jobs.push(job);
    this.processNext();
  }

  private async processNext() {
    const job = this.jobs.find(j => j.status === 'pending');
    if (!job) return;

    job.status = 'processing';
    job.attempts++;

    const handler = this.handlers.get(job.name);
    if (!handler) {
      console.error(`No handler for job: ${job.name}`);
      return;
    }

    try {
      await handler(job.data);
      job.status = 'completed';
    } catch (error) {
      if (job.attempts < job.maxAttempts) {
        job.status = 'pending'; // Retry
        setTimeout(() => this.processNext(), 2000 * job.attempts);
      } else {
        job.status = 'failed';
        console.error(`Job ${job.name} failed after ${job.attempts} attempts`);
      }
    }
  }
}

export const simpleQueue = new SimpleQueue();
```

---

## 10. Tradeoffs — Full Comparison

### Feature Comparison

```
┌─────────────────────┬──────────────────────┬──────────────────────┐
│ Feature             │ WITH Redis/BullMQ    │ WITHOUT (Simple)     │
├─────────────────────┼──────────────────────┼──────────────────────┤
│ Job persistence     │ ✅ Survives restart  │ ❌ Lost on restart   │
│ Auto-retry          │ ✅ Built-in          │ ❌ Manual impl       │
│ Rate limiting       │ ✅ Built-in          │ ❌ Manual impl       │
│ Priority queues     │ ✅ Built-in          │ ❌ Manual impl       │
│ Job monitoring      │ ✅ Dashboard UI      │ ❌ console.log only  │
│ Concurrent workers  │ ✅ Multi-process     │ ❌ Single process    │
│ Cache speed         │ ✅ ~1ms (RAM)        │ ⚠️ ~50ms (Postgres) │
│ Setup complexity    │ ⚠️ Needs Redis       │ ✅ Zero config       │
│ Deployment          │ ⚠️ Needs Redis svc   │ ✅ Just Node.js      │
│ Development ease    │ ⚠️ More boilerplate  │ ✅ Simple code       │
└─────────────────────┴──────────────────────┴──────────────────────┘
```

### What You Lose Without BullMQ

```
1. JOB PERSISTENCE
   With:    Job is in Redis → Server crashes → Job still there → Retry later
   Without: Job is in memory → Server crashes → Job is gone → Lost forever

2. RETRIES
   With:    Job fails → BullMQ waits 2s → Retries automatically
   Without: Job fails → You catch error → You implement retry logic

3. RATE LIMITING
   With:    "Max 10 API calls per minute" → BullMQ enforces
   Without: You track calls yourself → Easy to mess up

4. MONITORING
   With:    BullMQ Board UI shows: jobs/minute, failures, queue depth
   Without: console.log('job done') → Good luck debugging

5. CONCURRENCY
   With:    5 workers process 5 jobs simultaneously
   Without: 1 job at a time → Slow if you have 100 cafes
```

### What You Lose Without Redis

```
1. CACHE SPEED
   With:    Redis: 1ms read/write (RAM)
   Without: PostgreSQL: 50-100ms read/write (disk)
   Impact:  50-100x slower for cached data

2. DATA STRUCTURES
   With:    Lists, Sets, Sorted Sets, Hashes — great for queues
   Without: Just tables — awkward for job queues

3. AUTO-EXPIRY
   With:    SET key value EX 3600 → Auto-deletes after 1 hour
   Without: You delete manually or use PostgreSQL timestamps

4. PUB/SUB
   With:    Real-time notifications between services
   Without: Poll database repeatedly
```

### When to Use What

```
USE REDIS + BULLMQ WHEN:
├── You have multiple servers (horizontal scaling)
├── Jobs must survive server restarts
├── You need job monitoring/debugging
├── Rate limiting is critical
├── You have 100+ scheduled tasks
└── Production system with SLA requirements

USE SIMPLE APPROACH WHEN:
├── Single server deployment
├── Development/learning phase
├── Jobs can be re-run if lost
├── < 50 scheduled tasks
├── No Redis available (like Windows without Docker)
└── Prototype or MVP
```

### Migration Path: Start Simple → Scale Later

```
Phase 1 (Now):
┌─────────────────────────────────────────┐
│  node-cron → Direct function calls      │
│  PostgreSQL for data storage            │
│  In-memory cache for hot data           │
│  Manual retry with try/catch            │
└─────────────────────────────────────────┘
                │
                ▼ (When you need more)
Phase 2 (Later):
┌─────────────────────────────────────────┐
│  node-cron → BullMQ queues              │
│  Redis for caching + job storage        │
│  Built-in retries + rate limiting       │
│  Job monitoring dashboard               │
└─────────────────────────────────────────┘
```

### Quick Code: Switching Between Modes

```typescript
// lib/job-manager.ts — Abstract both approaches

interface JobManager {
  add(name: string, data: unknown): Promise<void>;
}

// Simple mode (no Redis)
class SimpleJobManager implements JobManager {
  async add(name: string, data: unknown) {
    await processJob(name, data);
  }
}

// BullMQ mode (with Redis)
class BullMQJobManager implements JobManager {
  async add(name: string, data: unknown) {
    await dataCollectQueue.add(name, data);
  }
}

// Toggle based on environment
export const jobManager: JobManager =
  process.env.REDIS_URL
    ? new BullMQJobManager()
    : new SimpleJobManager();
```

---

## 11. Summary: What Matters for Our App

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECOMMENDATION FOR YOUR APP                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  RIGHT NOW (Phase 1):                                           │
│  ✅ Keep: node-cron (works without Redis)                       │
│  ✅ Keep: PostgreSQL via Neon (your DB)                         │
│  ✅ Skip: Redis caching (use DB or in-memory)                   │
│  ✅ Skip: BullMQ (call functions directly)                      │
│  ✅ Add:  Manual retry with withRetry() utility                 │
│                                                                  │
│  LATER (Phase 2+):                                              │
│  ➕ Add Redis for caching                                        │
│  ➕ Add BullMQ for job queues                                    │
│  ➕ Add job monitoring                                           │
│                                                                  │
│  The app will work the same — just with slower cache            │
│  and no automatic retries until you add Redis.                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
