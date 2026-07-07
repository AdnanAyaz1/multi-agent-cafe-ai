---
name: project-starter
description: Use when starting a new project, onboarding to an existing project, or when the user says "start a project", "new project", "help me build", "learn this codebase", "what do I need to get started", or "set up my app". Guides through discovery, environment analysis, package selection with tradeoffs, project scaffolding, and production-ready implementation. Covers deployment-target-aware decisions, client project best practices, and step-by-step execution.
---

# Project Starter Skill

A systematic workflow for starting new projects or learning existing ones. Every decision is deliberate, production-focused, and deployment-aware.

---

## Overview

This skill follows a 7-phase workflow:

1. **Discovery** — Understand what we're building and for whom
2. **Environment Analysis** — Determine deployment target and constraints
3. **Package Research** — Find best libraries with tradeoff analysis
4. **Architecture Design** — Plan project structure and data flow
5. **Scaffolding** — Set up project with all tooling
6. **Implementation** — Build features step by step
7. **Production Hardening** — Security, performance, monitoring

**Never skip phases.** Each phase informs the next.

---

## Phase 1: Discovery

### Step 1.1: Understand the Product

Ask the user (or infer from context):

```
1. What are we building? (SaaS, marketplace, tool, etc.)
2. Who is the client/end user? (enterprise, SMB, consumer)
3. What are the core features? (list top 5-10)
4. What's the budget/timeline? (affects complexity decisions)
5. Any existing codebase or starting from scratch?
```

### Step 1.2: Technical Requirements

Determine:

```
1. Does it need auth? (who can access what)
2. Does it need payments? (Stripe, Paddle, etc.)
3. Does it need real-time features? (WebSocket, SSE)
4. Does it need background jobs? (queues, cron)
5. Does it need AI/ML? (which providers, what models)
6. Does it need file uploads/storage?
7. Does it need email/SMS notifications?
8. What's the data model complexity? (simple CRUD vs complex relations)
```

### Step 1.3: Client Constraints

For client projects, capture:

```
1. Must-use technologies? (client mandates specific stack)
2. Existing infrastructure? (AWS, GCP, Vercel, etc.)
3. Team size and skill level?
4. Maintenance plan? (who handles post-launch)
5. Compliance requirements? (GDPR, HIPAA, SOC2)
```

**Output**: A `PROJECT_BRIEF.md` with all findings.

---

## Phase 2: Environment Analysis

### Step 2.1: Deployment Target

Ask or determine the deployment target:

| Target | Characteristics | Best For |
|--------|----------------|----------|
| **Vercel** | Serverless, edge functions, auto-scaling, free tier generous | Next.js SaaS, landing pages, APIs |
| **AWS** | Full control, Lambda + EC2, complex pricing | Enterprise, compliance-heavy |
| **Railway** | Simple PaaS, Docker support, predictable pricing | Full-stack apps, background jobs |
| **Fly.io** | Edge compute, persistent volumes, cheap | Real-time apps, databases close to users |
| **Self-hosted** | Complete control, ops burden | On-premise, data sovereignty |
| **Docker + VPS** | Cheapest, most control | Budget projects, learning |

### Step 2.2: Environment Constraints

For each target, note:

```
- Serverless limitations (cold starts, execution time, memory)
- Database options (managed vs self-hosted)
- Redis/queue options (Upstash, Redis Labs, self-hosted)
- File storage (S3, R2, Blob)
- Cron/scheduler support
- Environment variable management
- CI/CD pipeline
```

### Step 2.3: Cost Analysis

Calculate estimated monthly cost:

```
Development phase:  $___/mo (usually free tier)
Launch (0-100 users): $___/mo
Growth (100-1000):    $___/mo
Scale (1000+):        $___/mo
```

**Output**: Updated `PROJECT_BRIEF.md` with environment details.

---

## Phase 3: Package Research

### Step 3.1: Core Stack Selection

For each category, research **at least 3 options** with tradeoffs:

#### Framework

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| Next.js | Full-stack, great DX, Vercel integration | Vercel lock-in risk, complex config | SaaS, landing pages |
| Remix | Web standards, simpler mental model | Smaller ecosystem | Content-heavy apps |
| SvelteKit | Tiny bundle, fast, simple | Smaller ecosystem | Performance-critical |
| Nuxt | Vue ecosystem, SSR | Heavier | Vue teams |
| Astro | Content-first, island architecture | Not for complex apps | Marketing sites |

#### Database

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| PostgreSQL | Powerful, relational, mature | Heavier setup | Complex data models |
| SQLite | Zero config, embedded | Limited concurrency | Prototypes, single-server |
| MongoDB | Flexible schema, JSON-native | Less ACID, schema drift | Rapid iteration |
| Supabase | PostgreSQL + auth + storage | Vendor lock-in | Rapid development |
| PlanetScale | MySQL, serverless, branching | Deprecated free tier | Team workflows |

#### ORM

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| Prisma | Type-safe, great DX, migrations | Heavy, runtime overhead | TypeScript projects |
| Drizzle | Lightweight, SQL-like, fast | Smaller ecosystem | Performance-critical |
| TypeORM | Decorator-based, mature | Verbose, less type-safe | Enterprise |
| Kysely | Type-safe SQL builder, fast | Manual query building | SQL-savvy teams |

#### Auth

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| NextAuth.js | Easy, multiple providers | Limited customization | Quick auth |
| Clerk | Managed, great UI | Vendor lock-in, pricing | SaaS |
| Lucia | Self-hosted, lightweight | More setup | Full control |
| Supabase Auth | Included with Supabase | Supabase dependency | Supabase users |

#### Payments

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| Stripe | Industry standard, great DX | Complex pricing | Most projects |
| Paddle | MoR, handles tax | Less flexible | International SaaS |
| LemonSqueezy | Simple, fast setup | Limited features | Small projects |
| Chargebee | Subscription management | Enterprise pricing | Complex billing |

#### UI Components

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| shadcn/ui | Copy-paste, customizable, Tailwind | Manual updates | Full control |
| Radix UI | Accessible, unstyled primitives | More styling work | Custom designs |
| Headless UI | Official, simple | Limited components | Tailwind users |
| MUI | Full-featured, Material Design | Heavy, opinionated | Enterprise |
| Ant Design | Comprehensive, mature | Heavy, Chinese-first | Admin panels |

#### State Management

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| Zustand | Simple, minimal boilerplate | Limited devtools | Small-medium apps |
| Jotai | Atomic, fine-grained | Learning curve | Complex state |
| Redux Toolkit | Battle-tested, devtools | Verbose | Large teams |
| TanStack Query | Server state, caching | Client state separate | API-heavy apps |
| XState | Visual, testable | Steep learning curve | Complex flows |

#### Background Jobs

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| BullMQ | Redis-based, reliable | Needs Redis | Traditional queues |
| Inngest | Serverless-native, no infra | Vendor lock-in | Vercel/serverless |
| Trigger.dev | Self-hosted, full control | More setup | Complex workflows |
| Temporal | Durable execution, reliable | Heavy, complex | Mission-critical |
| pg-boss | PostgreSQL-based, no Redis | Less features | PostgreSQL users |

#### Validation

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| Zod | Type-safe, great DX | Runtime overhead | TypeScript projects |
| Valibot | Smaller bundle, same API | Less ecosystem | Bundle-size critical |
| Yup | Simple, mature | Less type-safe | Quick forms |
| Joi | Battle-tested | Verbose, less TS | Legacy projects |

### Step 3.2: Present Options to User

For each critical choice, present:

```
## [Category] Options

### Option A: [Name]
- **Why**: [1-2 sentence reason]
- **Pros**: [list]
- **Cons**: [list]
- **Cost**: [if applicable]
- **Best for**: [use case]

### Option B: [Name]
...

### Option C: [Name]
...

### Recommendation: [Name]
[Why this is the best default choice]
```

**Ask the user to confirm or choose alternatives.**

### Step 3.3: Version Compatibility Check

For selected packages, verify:

```
1. Are all packages compatible with each other?
2. Are there known peer dependency conflicts?
3. Do they support the target Node.js version?
4. Are they actively maintained? (last commit < 6 months)
5. What's the bundle size impact?
```

---

## Phase 4: Architecture Design

### Step 4.1: Project Structure

Based on the stack, design the structure:

```
project/
├── app/                    # Pages and routes (Next.js App Router)
├── modules/                # Feature-based modules
│   └── <feature>/
│       ├── schemas.ts      # Zod validation schemas
│       ├── types.ts        # TypeScript types
│       ├── constants.ts    # Feature constants
│       ├── ui/             # Feature components
│       └── services/       # Business logic
├── lib/                    # Shared utilities
│   ├── db.ts              # Database singleton
│   ├── auth.ts            # Auth configuration
│   ├── errors.ts          # Error hierarchy
│   ├── logger.ts          # Structured logging
│   └── utils.ts           # Pure utilities
├── components/             # Shared UI components
│   ├── ui/                # shadcn primitives
│   └── providers.tsx      # Root providers
├── hooks/                  # Shared hooks
├── constants/              # Global constants
├── types/                  # Global types
├── prisma/                 # Database schema
├── tests/                  # Test files
└── scripts/                # Utility scripts
```

### Step 4.2: Data Flow Design

Map the core data flow:

```
User Action → UI Component → Hook → API Route → Service → Database
     ↓                                                    ↓
  State Update ←─────────────────────────────────────── Response
```

### Step 4.3: Error Strategy

Define error handling:

```
1. Custom error hierarchy (app-specific errors)
2. Centralized error handler (withErrorHandling wrapper)
3. User-facing error messages (never expose internals)
4. Error logging (structured, with context)
5. Error recovery (retry logic, fallbacks)
```

**Output**: Updated `PROJECT_BRIEF.md` with architecture.

---

## Phase 5: Scaffolding

### Step 5.1: Initialize Project

```bash
# For Next.js
npx create-next-app@latest project-name --typescript --tailwind --app --src-dir

# For other frameworks
# Follow official guides
```

### Step 5.2: Install Core Dependencies

Based on Phase 3 decisions:

```bash
# Database
npm install prisma @prisma/client
npx prisma init

# Auth (example: NextAuth)
npm install next-auth @auth/prisma-adapter

# Validation
npm install zod

# State management (example: TanStack Query)
npm install @tanstack/react-query

# UI (example: shadcn/ui)
npx shadcn@latest init
npx shadcn@latest add button card input
```

### Step 5.3: Configure Tooling

```bash
# Linting
npm install -D eslint @typescript-eslint/parser prettier

# Testing (example: Vitest)
npm install -D vitest @testing-library/react

# Git hooks
npm install -D husky lint-staged
```

### Step 5.4: Set Up Environment

Create `.env.example`:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
AUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# AI (if applicable)
OPENAI_API_KEY="..."

# Payments (if applicable)
STRIPE_SECRET_KEY="..."
```

### Step 5.5: Create Configuration Files

- `tsconfig.json` with strict mode
- `.eslintrc.json` with production rules
- `.prettierrc` with team conventions
- `Dockerfile` if containerizing
- `.github/workflows/ci.yml` for CI/CD

---

## Phase 6: Implementation

### Step 6.1: Core Infrastructure First

Build in this order:

```
1. Database schema + migrations
2. Auth system (login, signup, session)
3. Error handling (custom errors, handler)
4. API layer (withErrorHandling wrapper)
5. Logging (structured, no console.log)
6. Database singleton (with connection pooling)
```

### Step 6.2: Feature Development

For each feature:

```
1. Define Zod schemas (source of truth)
2. Derive TypeScript types from schemas
3. Build API routes with auth checks
4. Build UI components (Server Components first)
5. Add client interactivity only where needed
6. Write tests for business logic
7. Add error handling and loading states
```

### Step 6.3: Quality Gates

After each feature:

```bash
npm run lint          # Must pass
npx tsc --noEmit     # Type check
npm test             # Tests pass
```

---

## Phase 7: Production Hardening

### Step 7.1: Security Checklist

- [ ] No secrets in code (use env vars)
- [ ] Input validation on all API routes (Zod)
- [ ] Auth checks on all protected routes
- [ ] Rate limiting on public endpoints
- [ ] CORS configured correctly
- [ ] CSP headers set
- [ ] SQL injection prevented (ORM parameterized queries)
- [ ] XSS prevented (React escapes by default)
- [ ] CSRF protection (SameSite cookies)

### Step 7.2: Performance Checklist

- [ ] Database indexes on frequent queries
- [ ] Connection pooling configured
- [ ] API response caching (where appropriate)
- [ ] Image optimization (Next.js Image)
- [ ] Bundle analysis (no unnecessary deps)
- [ ] Lazy loading (dynamic imports)

### Step 7.3: Monitoring Checklist

- [ ] Structured logging (JSON, with context)
- [ ] Error tracking (Sentry, Logtail, etc.)
- [ ] Performance monitoring (Vercel Analytics, etc.)
- [ ] Uptime monitoring (BetterStack, etc.)

### Step 7.4: Deployment Checklist

- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] CI/CD pipeline working
- [ ] Health check endpoint
- [ ] Graceful shutdown handling

---

## Learning an Existing Codebase

When the user says "help me learn this codebase" or "what do I need to get started":

### Step L1: Project Overview

```
1. Read README.md, package.json, and any docs
2. Identify the tech stack
3. List all dependencies with purposes
4. Understand the project structure
```

### Step L2: Architecture Analysis

```
1. Map the data flow (UI → API → DB → Response)
2. Identify the auth system
3. Find the error handling pattern
4. Locate the database schema
5. Understand the deployment setup
```

### Step L3: Codebase Tour

Provide a guided tour:

```
1. Entry points (pages, API routes)
2. Core business logic (services, agents)
3. Data layer (ORM, queries)
4. UI layer (components, hooks)
5. Configuration (env, tooling)
```

### Step L4: Development Workflow

Explain:

```
1. How to run locally
2. How to add a new feature
3. How to test changes
4. How to deploy
5. Common pitfalls and gotchas
```

---

## Decision Log Template

Maintain a decision log throughout:

```markdown
# Decision Log

## [Date] - [Decision]
- **Context**: [Why we're making this decision]
- **Options**: [What we considered]
- **Decision**: [What we chose]
- **Rationale**: [Why we chose it]
- **Consequences**: [What this means going forward]
```

---

## Common Patterns

### API Route with Error Handling

```typescript
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';

export const POST = withErrorHandling(async (request) => {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();

  const body = await request.json();
  // Validate with Zod
  // Process
  // Return response
});
```

### Server Component with Data Fetching

```typescript
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const data = await prisma.someModel.findMany({
    where: { userId: session.user.id },
  });

  return <Dashboard data={data} />;
}
```

### Client Component with Hook

```typescript
'use client';

import { useData } from '@/hooks/use-data';

export function Dashboard({ initialData }) {
  const { data, isLoading, error } = useData(initialData);

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return <div>{/* Render data */}</div>;
}
```

---

## Anti-Patterns to Avoid

1. **Skipping discovery** — Building without understanding leads to rework
2. **Premature optimization** — Don't add complexity until needed
3. **Vendor lock-in** — Prefer abstractions over direct provider calls
4. **Console.log in production** — Use structured logging
5. **Any types** — defeats the purpose of TypeScript
6. **Business logic in components** — Keep components pure
7. **Hardcoded values** — Use constants and environment variables
8. **Skipping tests** — Manual testing doesn't scale
9. **Ignoring errors** — Silent failures hide bugs
10. **No monitoring** — You can't fix what you can't see

---

## Trigger Keywords

This skill activates when the user says:

- "Start a new project"
- "Help me build..."
- "I want to create..."
- "Learn this codebase"
- "What do I need to get started"
- "Set up my app"
- "Onboard me to this project"
- "What's the architecture here"
- "Help me understand this code"
- "What packages should I use"
- "Recommend a stack for..."
