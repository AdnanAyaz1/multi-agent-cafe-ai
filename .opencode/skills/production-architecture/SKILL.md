---
name: production-architecture
description: Use when writing any new code, creating files, components, modules, hooks, utilities, lib modules, API routes, or modifying existing code. Enforces production-grade architecture: feature-based modular organization, strict layered separation (Pages → Components → Hooks → Lib), custom error hierarchy, schema-first Zod validation, server-only guards, zero tolerance for `any`, and structured error handling. Applies to Next.js App Router, React, monoliths, monorepos, and any modern TypeScript project.
---

# Production Architecture Skill

The unified coding standard for building maintainable, production-ready TypeScript applications. Every rule here exists to prevent a specific class of bug or maintenance disaster.

---

## 1. Architecture: Feature Modules + Strict Layers

Combine feature-based organization with strict layered separation. Each feature is a self-contained module. Data flows downward through layers. Never skip layers.

### Layer Rule

```
PAGE (Server Component)
  └─> COMPONENT (Server or Client)
        └─> HOOK (Client-side state + effects)
              └─> LIB (Server/shared business logic)
                     └─> CONSTANTS / TYPES
```

- A **Page** only renders. It composes components and passes data down.
- A **Component** only receives props and renders UI. No API calls, no business logic.
- A **Hook** owns state, side effects, and API calls. No JSX rendering.
- **Lib** owns business logic, DB access, external services. No React imports.

### Module Structure

```
modules/
  <feature>/
    schemas.ts            # Zod validation schemas (single source of truth)
    types.ts              # TypeScript types derived from schemas
    constants.ts          # Feature-specific constants (as const)
    atoms.ts              # Client state (Jotai) — optional, if many atoms
    utils.ts              # Feature-specific pure utilities — optional
    ui/
      components/         # Reusable UI components for this feature
      layouts/            # Structural layout wrappers
      views/              # Page-level view components
      screens/            # Distinct screen states (for SPAs/widgets)
      loading.tsx         # Skeleton/loading states
      guard.tsx           # Auth/permission wrappers
```

### Shared Code (Outside Modules)

```
lib/
  errors.ts               # Custom error hierarchy
  handlers/
    errors.ts             # Centralized error handler
  api/
    with-error-handling.ts # DRY route handler wrapper
  validators/
    index.ts              # parseBody() helper
  db.ts                   # Database singleton
  redis.ts                # Redis singleton
  utils.ts                # cn() and shared utilities
  logger.ts               # Structured logging (no console.log)
components/
  ui/                     # shadcn/ui primitives (button, card, input)
  providers.tsx           # Root provider composition
hooks/
  use-<name>.ts           # Shared hooks (one per file)
constants/
  <feature>.ts            # Shared constants
types/
  <feature>.ts            # Shared types
```

### Monolith Layout

```
src/
  modules/
  lib/
  components/
  hooks/
  constants/
  types/
  app/                    # Next.js App Router
```

### Monorepo Layout

```
apps/
  web/
    modules/              # App-specific features
    app/                  # App Router pages
packages/
  ui/                     # Shared UI component library
  backend/                # Shared backend logic
```

---

## 2. File & Directory Naming

### Rules
| Type | Convention | Example |
|------|-----------|---------|
| **Components** | `kebab-case.tsx` | `dashboard-sidebar.tsx` |
| **Hooks** | `use-kebab-case.ts` | `use-infinite-scroll.ts` |
| **Atoms** | `atoms.ts` or `<feature>-atoms.ts` | `widget-atoms.ts` |
| **Constants** | `<feature>.ts` or `constants.ts` | `pipeline.ts` |
| **Types** | `<feature>.ts` or `types.ts` | `dashboard-home.ts` |
| **Schemas** | `<feature>.ts` or `schemas.ts` | `auth.ts` |
| **Lib modules** | `kebab-case.ts` | `analysis-worker.ts` |
| **Utils** | `utils.ts` or `<feature>-utils.ts` | `greeting.ts` |
| **Layouts** | `<feature>-layout.tsx` | `dashboard-layout.tsx` |
| **Views** | `<feature>-view.tsx` | `conversations-view.tsx` |
| **Screens** | `<feature>-screen.tsx` | `widget-chat-screen.tsx` |
| **Guards** | `<feature>-guard.tsx` | `auth-guard.tsx` |
| **Skeletons** | `<feature>-loading.tsx` | `conversations-loading.tsx` |
| **Validators** | `<feature>.ts` in `lib/validators/` | `auth.ts`, `weather.ts` |

### Extensions
- `.tsx` — files containing JSX
- `.ts` — files without JSX (hooks, utils, types, constants, schemas, lib)
- `.css` — only for global styles or design tokens

---

## 3. Export Patterns

### Named Exports ONLY

```tsx
// CORRECT
export const DashboardSidebar = () => { ... };
export const AuthGuard = ({ children }: { children: React.ReactNode }) => { ... };
export function Providers({ children }: { children: React.ReactNode }) { ... }

// WRONG
export default function DashboardSidebar() { ... }
```

**Exceptions** (framework-required defaults only):
- Next.js `page.tsx`, `layout.tsx`, `middleware.ts`, `next.config.*`
- These must be thin wrappers that delegate to named-export module code

### No Barrel / Index Files

Import directly from specific files. For shared packages, use `package.json` exports:

```json
{
  "exports": {
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.ts",
    "./lib/*": "./src/lib/*.ts"
  }
}
```

```ts
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
```

---

## 4. Import Conventions

### Path Aliases

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@workspace/ui/*": ["../packages/ui/src/*"],
      "@workspace/backend/*": ["../packages/backend/*"]
    }
  }
}
```

### Import Order

```tsx
// 1. Server-only guard (if applicable)
import 'server-only';

// 2. External packages
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue } from "jotai";

// 3. Shared workspace packages
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

// 4. App-local module imports
import { statusFilterAtom } from "@/modules/dashboard/atoms";
import { DashboardLayout } from "@/modules/dashboard/ui/layouts/dashboard-layout";

// 5. Relative imports (within same module only)
import { SomeType } from "../types";
```

### Rules
- **Named imports exclusively** — no `import DefaultExport from "..."` for components
- **Deep path imports** — import from specific files, not barrel indexes
- **Type-only imports** — use `import type` when importing only types:

```ts
import type { LanguageModel } from 'ai';
import type { AgentName } from '@/lib/agents/types';
```

---

## 5. TypeScript Standards

### Compiler Settings

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2022",
    "jsx": "preserve",
    "noEmit": true,
    "declaration": true,
    "resolveJsonModule": true
  }
}
```

### Zero `any` — Use `unknown`

```ts
// WRONG
function process(data: any) { ... }

// CORRECT
function process(data: unknown) {
  if (typeof data !== 'object' || data === null) {
    throw new ValidationError('Invalid data');
  }
  // narrow with type guards
}
```

### Schema-First Type Derivation

Zod schema is the single source of truth. TypeScript types are derived:

```ts
// lib/validators/auth.ts
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;
```

### `as const` Enum Pattern (No TypeScript `enum`)

```ts
// CORRECT
export const ACTION_TYPES = ['promote', 'discount', 'hold', 'remove'] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const MENU_CATEGORIES = ['hot-drink', 'cold-drink', 'food', 'dessert'] as const;
export type MenuCategory = (typeof MENU_CATEGORIES)[number];

// WRONG
enum ActionType { Promote, Discount, Hold, Remove }
```

### Component Props

```tsx
// Simple props — inline
export const WidgetHeader = ({ children, className }: {
  children: React.ReactNode;
  className?: string;
}) => { ... };

// Complex props — separate type
type InfoSection = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: InfoItem[];
};

// Layout props — use Readonly
export const DashboardLayout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => { ... };
```

### Hook Return Type Interfaces

```ts
// hooks/useLoginForm.ts
export interface UseLoginFormReturn {
  loading: boolean;
  error: string;
  login: (email: string, password: string, callbackUrl: string) => Promise<void>;
  clearError: () => void;
}

export function useLoginForm(): UseLoginFormReturn {
  // ...
}
```

---

## 6. Error Handling

### Custom Error Hierarchy

```ts
// lib/errors.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class UpstreamError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 502, 'UPSTREAM_ERROR', details);
    this.name = 'UpstreamError';
  }
}

export class AgentError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'AGENT_ERROR', details);
    this.name = 'AgentError';
  }
}

export class PipelineCancelledError extends Error {
  constructor(reason?: string) {
    super(`Pipeline cancelled: ${reason ?? 'user requested'}`);
    this.name = 'PipelineCancelledError';
  }
}

export class PipelineTerminalError extends Error {
  public readonly reason: 'rate_limit' | 'quota_exceeded';
  constructor(reason: 'rate_limit' | 'quota_exceeded', message: string) {
    super(message);
    this.name = 'PipelineTerminalError';
    this.reason = reason;
  }
}
```

### Centralized API Error Handler

```ts
// lib/handlers/errors.ts
import { AppError } from '@/lib/errors';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

type ResponseType = 'api' | 'server';

export function handleError(error: unknown, responseType: ResponseType = 'api') {
  if (error instanceof AppError) {
    if (responseType === 'api') {
      return NextResponse.json(
        { error: error.message, code: error.code, details: error.details },
        { status: error.statusCode }
      );
    }
    return { error: error.message, code: error.code };
  }

  if (error instanceof ZodError) {
    const message = error.errors.map(e => e.message).join(', ');
    if (responseType === 'api') {
      return NextResponse.json({ error: message, code: 'VALIDATION_ERROR' }, { status: 400 });
    }
    return { error: message, code: 'VALIDATION_ERROR' };
  }

  if (error instanceof Error) {
    if (responseType === 'api') {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    return { error: 'Internal server error', code: 'INTERNAL_ERROR' };
  }

  if (responseType === 'api') {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
  return { error: 'Internal server error', code: 'INTERNAL_ERROR' };
}
```

### Client-Side Error Handling

```tsx
// Hooks: toast notifications + state
const handleAction = async () => {
  try {
    await someMutation({ id });
    toast.success('Done');
  } catch (error) {
    // errors bubble to global error boundary or toast
    toast.error('Something went wrong');
  }
};

// Loading state distinction: undefined = loading, null = no data
if (data === undefined) return <LoadingSkeleton />;
if (data === null) return <EmptyState />;
```

---

## 7. Validation Patterns

### Server-Side: parseBody()

```ts
// lib/validators/index.ts
import { ZodSchema } from 'zod';
import { ValidationError } from '@/lib/errors';

export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }
  return schema.parse(body);
}
```

### Client-Side: react-hook-form + Zod

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";

export const LoginForm = () => {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* ... */}
      </form>
    </Form>
  );
};
```

### Strict Schemas (Reject Unknown Fields)

```ts
export const competitorSchema = z.object({
  businessId: z.string().min(1),
  url: z.string().url(),
}).strict();
```

### Validation Schemas Co-located with Module

```
modules/
  auth/
    schemas.ts         # loginSchema, registerSchema
    types.ts           # LoginInput, RegisterInput
  contact/
    schemas.ts         # contactFormSchema
    types.ts           # ContactForm
lib/
  validators/
    index.ts           # parseBody() helper
    auth.ts            # shared auth schemas
    weather.ts         # shared weather schemas
```

---

## 8. API Route Patterns

### DRY: withErrorHandling Wrapper

Never write try/catch in route handlers. Use the wrapper:

```ts
// lib/api/with-error-handling.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/lib/handlers/errors';

type RouteContext = { params: Promise<Record<string, string>> };
type RouteHandler = (request: NextRequest, context?: RouteContext) => Promise<NextResponse>;

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error) as NextResponse;
    }
  };
}
```

### Standard Route Handler (DRY)

```ts
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/api/with-error-handling';
import { parseBody } from '@/lib/validators';
import { resourceSchema } from '@/lib/validators/resource';

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await parseBody(request, resourceSchema);
  const result = await createResource(body);
  return NextResponse.json(result, { status: 201 });
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const result = await getResource(id);
  return NextResponse.json(result);
});
```

### Async Pipeline Dispatch (202 Accepted)

```ts
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { businessId, pipelineType } = await parseBody(request, runAnalysisSchema);
  const pipelineId = crypto.randomUUID();

  await inngest.send({
    name: 'pipeline/run',
    data: { businessId, pipelineId, pipelineType },
  });

  return NextResponse.json({
    pipelineId,
    status: 'queued',
    statusUrl: `/api/analysis/${pipelineId}`,
  }, { status: 202 });
});
```

### Auth Check at Top of Every Handler

```ts
export const POST = withErrorHandling(async (request: NextRequest) => {
  const identity = await auth();
  if (!identity?.userId) throw new UnauthorizedError();
  if (!identity.orgId) throw new UnauthorizedError('Organization not found');

  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) throw new NotFoundError('Conversation');
  if (conversation.organizationId !== identity.orgId) throw new UnauthorizedError();

  // ... business logic — no try/catch needed, errors bubble to wrapper
  return NextResponse.json(result);
});
```

### Why This Works

The wrapper catches ALL errors (AppError, ZodError, UnknownError) and delegates to `handleError()`. Your handler only throws — it never catches. This means:

- **Zero try/catch** in route handlers
- **Consistent error responses** across every endpoint
- **Auth checks** throw `UnauthorizedError` / `NotFoundError` directly
- **parseBody** throws `ValidationError` on invalid input
- All errors flow to the same `handleError()` function

---

## 9. Component Patterns

### Server Components by Default

Pages and layouts are Server Components unless they need hooks/event handlers:

```tsx
// app/dashboard/layout.tsx — Server Component (no directive)
import { DashboardGuard } from "@/modules/dashboard/ui/guard/dashboard-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardGuard>{children}</DashboardGuard>;
}
```

### "use client" Only When Needed

```tsx
"use client";

import { useLoginForm } from "@/hooks/use-login-form";
import { Button } from "@/components/ui/button";

export const LoginForm = () => {
  const { loading, error, login } = useLoginForm();
  // ...
};
```

### Props-Driven Components

```tsx
// CORRECT — accepts props, renders dynamically
interface WelcomeBannerProps {
  weather: { temperature: number; condition: string } | null;
}

export const WelcomeBanner = ({ weather }: WelcomeBannerProps) => {
  return (
    <div>
      {weather && <p>{weather.temperature}°C — {weather.condition}</p>}
    </div>
  );
};

// WRONG — hardcoded content
export const WelcomeBanner = () => {
  return <div><p>25°C — Sunny</p></div>;
};
```

### Guard Pattern

```tsx
"use client";

import { useDashboardGuard } from "@/hooks/use-dashboard-guard";

export const DashboardGuard = ({ children }: { children: React.ReactNode }) => {
  const { loading } = useDashboardGuard();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};
```

### Provider Composition

```tsx
// components/providers.tsx
"use client";

import { Provider } from "jotai";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider> {/* Jotai — single provider, wraps entire app */}
        {children}
      </Provider>
      <Toaster position="bottom-right" richColors />
    </SessionProvider>
  );
}

// Layout wraps with guards only — no duplicate Provider
export const DashboardLayout = async ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <AuthGuard>
      <OrganizationGuard>
        <SidebarProvider>
          <DashboardSidebar />
          <main>{children}</main>
        </SidebarProvider>
      </OrganizationGuard>
    </AuthGuard>
  );
};
```

### Loading / Skeleton Components

Co-locate with their parent view:

```tsx
export const ConversationsLoading = () => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-lg p-2">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## 10. Styling Conventions

### Tailwind CSS + cn()

- **No CSS modules, no styled-components** — Tailwind utility classes only
- **`cn()` for conditional classes:**

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base classes",
  isActive && "active classes",
  className
)} />
```

### cn() Utility

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### shadcn/ui Component Pattern

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = ({ className, variant, size, asChild = false, ...props }: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
};

export { Button, buttonVariants };
```

### Design Tokens (CSS Variables)

```css
:root {
  --primary: oklch(0.6231 0.188 259.8145);
  --primary-foreground: oklch(1 0 0);
  --background: oklch(1 0 0);
  --foreground: oklch(0.3211 0 0);
  --radius: 0.475rem;
}

.dark {
  --primary: oklch(0.5 0.15 259);
}
```

---

## 11. State Management

### Client State — Jotai

```ts
// modules/feature/atoms.ts
import { atom } from "jotai";
import { atomWithStorage, atomFamily } from "jotai/utils";

export const screenAtom = atom("loading");
export const statusFilterAtom = atom<string | null>(null);
export const userAtomFamily = atomFamily(
  (userId: string) => atomWithStorage(`user-${userId}`, null)
);
export const hasFilterAtom = atom((get) => get(statusFilterAtom) !== null);
```

### Server State — Data Fetching

```tsx
// Conditional query with "skip" sentinel
const data = useQuery(api.endpoint, args ? { id: args.id } : "skip");

// Loading state: undefined = loading, null = no data
if (data === undefined) return <LoadingSkeleton />;
if (data === null) return <EmptyState />;
```

### Custom Hooks (One Per File)

```ts
// hooks/use-weather.ts
"use client";

import { useState, useEffect, useCallback } from 'react';

export interface UseWeatherReturn {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWeather(city: string): UseWeatherReturn {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const json = await res.json();
      setData(json.data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);
  return { data, loading, error, refresh: fetchWeather };
}
```

### Page Delegates to Hook

```tsx
// app/dashboard/page.tsx
"use client";

import { useHomeDashboard } from "@/hooks/use-home-dashboard";
import { WelcomeBanner } from "@/modules/dashboard/ui/components/welcome-banner";
import { StatWidget } from "@/modules/dashboard/ui/components/stat-widget";

export default function DashboardPage() {
  const { weather, loading } = useHomeDashboard();

  return (
    <div className="space-y-6">
      <WelcomeBanner weather={weather} />
      <div className="grid grid-cols-4 gap-4">
        <StatWidget label="Weather" value={weather ? `${weather.temperature}°C` : '—'} />
      </div>
    </div>
  );
}
```

---

## 12. Database & Service Singletons

### Proxy-Based Lazy Singleton (Prisma)

```ts
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const _prisma = new PrismaClient();

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = _prisma;
  }

  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const target = getPrisma();
    const value = (target as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  },
});
```

### Redis Singleton (Same Pattern)

```ts
// lib/redis.ts
import Redis from 'ioredis';
import { AppError } from '@/lib/errors';

const globalForRedis = globalThis as unknown as { redis: Redis };

function getRedis() {
  if (globalForRedis.redis) return globalForRedis.redis;

  const url = process.env.REDIS_URL;
  if (!url) throw new AppError('REDIS_URL is not set', 500, 'MISSING_ENV');

  const _redis = new Redis(url);

  if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = _redis;
  }

  return _redis;
}

export const redis = new Proxy({} as Redis, {
  get(_, prop) {
    const target = getRedis();
    const value = (target as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') return value.bind(target);
    return value;
  },
});
```

---

## 13. Server-Only Guard

Any module that must never be imported into client code starts with:

```ts
import 'server-only';

// ... rest of module
```

Apply to:
- All `lib/` modules that access DB, Redis, or external services
- Pipeline and agent implementations
- Worker files
- Service clients

This catches accidental client imports at **compile time**, not runtime.

---

## 14. Configuration Management

### Environment Variables

- **Server-only**: `DATABASE_URL`, `REDIS_URL`, `AUTH_SECRET`, `STRIPE_SECRET_KEY`, API keys
- **Client-exposed**: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Model overrides**: `MODEL_MENU_ANALYST`, `GOOGLE_MODEL_OVERRIDE`
- **Cron schedules**: `WEATHER_FETCH_CRON`, `DAILY_ANALYSIS_CRON`
- **Concurrency**: `ANALYSIS_CONCURRENCY`, `COMPETITOR_CONCURRENCY`

Always maintain a `.env.example` documenting all variables.

### ESLint (Flat Config v9)

```js
// eslint.config.js
import { nextJsConfig } from "@workspace/eslint-config/next-js";
export default nextJsConfig;
```

### Prettier

Use Prettier defaults. Format command: `prettier --write "**/*.{ts,tsx,md}"`

### Package Manager

Use **pnpm** with workspaces. Internal packages via `@workspace/*` and `workspace:*` protocol.

---

## 15. Quick Reference Checklist

When writing any new code, ensure:

### Architecture
- [ ] Code is in the **correct layer** (Page → Component → Hook → Lib)
- [ ] Features are organized in **modules/** with `ui/{components,layouts,views,loading,guard}`
- [ ] **No business logic** in `.tsx` files — move to `lib/`
- [ ] **No constants** in component/page files — move to `constants/`
- [ ] **No types** in component/page files — move to `types/`

### TypeScript
- [ ] **No `any`** — use `unknown` and narrow with type guards (including wrapper types)
- [ ] **Strict mode** enabled with `noUncheckedIndexedAccess`
- [ ] **Schema-first** — Zod schema → `z.infer<>` type
- [ ] **`as const`** for enum-like constants (no TypeScript `enum`)
- [ ] **`import type`** for type-only imports
- [ ] **No `!` non-null assertions** on env vars — validate at startup

### Exports & Imports
- [ ] **Named exports only** (no default exports except framework-required)
- [ ] **No barrel/index files** — import from specific files
- [ ] **`import 'server-only'`** on all server-only modules
- [ ] **`"use client"`** only when hooks/event handlers are used
- [ ] Imports follow: server-only → external → workspace → app-local → relative

### Error Handling
- [ ] **`withErrorHandling()`** wraps every route handler — no try/catch in handlers
- [ ] **Custom error classes** for all error types (AppError hierarchy)
- [ ] **Centralized `handleError()`** handles all errors uniformly
- [ ] **`parseBody(request, schema)`** validates all POST/PUT/PATCH
- [ ] **Auth check at top** of every mutation/query handler (throws, doesn't catch)
- [ ] **Structured error codes** (`{ code, message }`) — not raw strings

### Components
- [ ] **Props-driven** — no hardcoded content
- [ ] **`cn()` for conditional classes** — no CSS modules
- [ ] **Guard pattern** for auth/permission checks
- [ ] **Skeleton/loading** components co-located with views
- [ ] **shadcn/ui CVA pattern** for reusable primitives

### State
- [ ] **Jotai atoms** for client state (per module)
- [ ] **One hook per file** with exported return type interface
- [ ] **Page delegates to hook** — page only renders, hook owns logic
- [ ] **`undefined` = loading, `null` = no data** distinction

### Services
- [ ] **Proxy singletons** for DB/Redis (globalThis dev cache)
- [ ] **No `console.log`** in production — use logger
- [ ] **No `!` non-null assertions** on env vars — throw early if missing
- [ ] **`res.ok` check** before parsing fetch responses in hooks

---

## 16. Adapting to Your Architecture

### Monolith (Single App)
Place `modules/` directly under `src/`. Use `@/` path alias. Keep shared UI in `src/components/ui/`. Apply the same layer rules.

### Monorepo
Use `apps/` for deployable apps, `packages/` for shared libraries. Reference via `@workspace/*` aliases and `package.json` exports.

### Backend-Only / API Projects
Apply the same `lib/` structure for business logic, `lib/validators/` for Zod schemas, the error hierarchy, and `parseBody()`. Skip React-specific layers.

### Legacy / Existing Projects
Adopt incrementally:
1. Add the error hierarchy and `handleError()` — immediate safety
2. Add `parseBody()` for API validation
3. Add `import 'server-only'` to server modules
4. Move business logic out of components into `lib/`
5. Extract state into dedicated hooks
6. Replace `any` with `unknown` file by file
7. Add feature modules for new code
8. Migrate existing code feature-by-feature
