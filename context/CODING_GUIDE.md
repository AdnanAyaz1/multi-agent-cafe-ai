# Coding Guide

## 1. Forms — React Hook Form + Zod

All forms must use `react-hook-form` for state management and `zod` for validation. Never use raw `useState` for form fields.

### Schema First

Define the schema in `lib/validators/<domain>.ts`, then derive the TypeScript type from it.

```ts
// lib/validators/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### Form Component

```tsx
// components/auth/LoginForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';

export function LoginForm({ onSubmit }: { onSubmit: (data: LoginInput) => void }) {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Email"
        error={form.formState.errors.email?.message}
      >
        <input {...form.register('email')} type="email" placeholder="you@example.com" />
      </FormField>

      <FormField
        label="Password"
        error={form.formState.errors.password?.message}
      >
        <input {...form.register('password')} type="password" placeholder="••••••••" />
      </FormField>

      <Button type="submit" disabled={form.formState.isSubmitting}>
        Sign in
      </Button>
    </form>
  );
}
```

### Rules

- One schema per domain file in `lib/validators/`.
- Derive types with `z.infer<>` — never define types manually alongside schemas.
- Forms always go in `components/` — never inline in pages.
- Use `zodResolver` from `@hookform/resolvers/zod`.
- Server-side validation reuses the same schema via `lib/validators/index.ts` `parseBody()`.
- Never use raw `useState` for individual form fields.

---

## 2. State & Application Logic — Custom Hooks

All stateful logic lives in `hooks/`. Pages and components delegate to hooks and only handle rendering.

### Pattern

```ts
// hooks/useLoginForm.ts
'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export function useLoginForm(callbackUrl: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, login };
}
```

```tsx
// components/auth/LoginForm.tsx
export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const { loading, error, login } = useLoginForm(callbackUrl);
  const form = useForm<LoginInput>({ ... });

  return (
    <form onSubmit={form.handleSubmit((data) => login(data.email, data.password))}>
      {/* ... */}
    </form>
  );
}
```

### Rules

- One hook per file in `hooks/`.
- Hooks handle: state, side effects, API calls, event handlers.
- Components handle: rendering only.
- Hooks must be typed — export interfaces for return values.
- Prefix with `use`.

---

## 3. Reusable Components

All UI primitives live in `components/ui/` (shadcn). All composed, reusable blocks live in `components/<domain>/`.

### Component Structure

```
components/
  ui/                  # shadcn primitives (Button, Input, Card, Badge)
  layout/              # Header, Sidebar, Footer, PageWrapper
  forms/               # FormField, FormSelect, FormCheckbox
  dashboard/           # Dashboard-specific composed components
  landing/             # Landing page sections
  auth/                # LoginForm, RegisterForm, etc.
```

### Building a Reusable FormField

```tsx
// components/ui/form-field.tsx
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="block text-[11px] font-medium text-[#a09890] uppercase tracking-[0.15em]">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
```

### Building a Reusable Modal

```tsx
// components/ui/modal.tsx
'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={cn('glass-card rounded-3xl p-6 border border-white/[0.08] max-w-lg w-full', className)}>
        {children}
      </div>
    </div>
  );
}
```

### Rules

- `components/ui/` — primitives only (Button, Input, Card, Badge, Modal, FormField, FormSelect).
- Components must accept props — no hardcoded content.
- One component per file.
- No business logic in components — delegate to hooks.
- No constants in components — move to `constants/`.
- `'use client'` only when the component uses hooks or event handlers.

---

## 4. Separation of Concerns

```
┌─────────────────────────────────────────────────────┐
│                    PAGE (Server)                     │
│  Data fetching, route params, metadata              │
│  Renders <Component /> with props                   │
├─────────────────────────────────────────────────────┤
│                 COMPONENT (Client)                   │
│  UI layout, composition, rendering                  │
│  Delegates logic to HOOK                            │
├─────────────────────────────────────────────────────┤
│                   HOOK (Client)                      │
│  useState, useEffect, API calls, event handlers     │
│  Pure orchestration logic                           │
├─────────────────────────────────────────────────────┤
│              LIB (Server / Shared)                   │
│  Business logic, calculations, DB, services         │
│  Validators, formatters, error classes              │
├─────────────────────────────────────────────────────┤
│                 CONSTANTS                            │
│  Enums, arrays, config objects, magic strings       │
├─────────────────────────────────────────────────────┤
│                   TYPES                             │
│  TypeScript interfaces, shared type definitions     │
└─────────────────────────────────────────────────────┘
```

### Directory Reference

| Directory | Contains | Example |
|---|---|---|
| `app/` | Next.js pages + API routes | `app/auth/login/page.tsx` |
| `components/` | Reusable composed UI | `components/auth/LoginForm.tsx` |
| `components/ui/` | shadcn primitives | `components/ui/button.tsx` |
| `hooks/` | Custom hooks (state + effects) | `hooks/useLoginForm.ts` |
| `lib/` | Business logic, DB, services | `lib/auth.ts`, `lib/db.ts` |
| `lib/validators/` | Zod schemas | `lib/validators/auth.ts` |
| `constants/` | All constants, enums, config | `constants/navigation.ts` |
| `types/` | TypeScript interfaces | `types/dashboard.ts` |
| `utils/` | Pure utility functions | `utils/format.ts` |

### Hard Rules

- **No `any`** — use `unknown` and narrow with type guards.
- **No `console.log`** in production — use `lib/logger.ts`.
- **No constants** in component/page files — move to `constants/`.
- **No interfaces/types** in component/page files — move to `types/`.
- **No business logic** in `.tsx` files — move to `lib/`.
- **No raw `useState` for forms** — use react-hook-form + zod.
- **`'use client'`** only on files that use hooks or event handlers.
- **Server-only modules** guarded with `server-only`.
- **Each component** must be in its own file.
- **All components** must accept props (dynamic, not hardcoded).

---

## 5. Design System

This project uses a custom design system defined in `app/globals.css`.

### Key Classes

| Class | Usage |
|---|---|
| `glass-card` | Glassmorphism card with backdrop blur and border |
| `gradient-text` | Sienna-to-sand gradient text |
| `gradient-bg` | Sienna-to-sand gradient background |
| `animated-gradient-bg` | Animated gradient background |
| `dot-grid` | Subtle dot grid overlay |
| `card-glow` | Animated gradient border on hover |
| `soft-shadow` | Sienna-tinted shadow |
| `active-glow` | Strong sienna glow effect |

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| Primary | `#e07850` | Buttons, links, accents |
| Secondary | `#c8a070` | Success, positive states |
| Background | `#0e0c0a` | Page background |
| Card | `#161412` | Card backgrounds |
| Muted | `#a09890` | Secondary text |
| Foreground | `#dee3e7` | Primary text |

### Typography

| Font | Usage |
|---|---|
| Montserrat | Headings (`--font-montserrat`) |
| JetBrains Mono | Labels, badges, monospace (`--font-jetbrains-mono`) |
| Inter | Body text (`--font-inter`) |

### Component Styling

Always use the design system classes instead of inline Tailwind:

```tsx
// Good
<div className="glass-card rounded-3xl p-6 border border-white/[0.08]">

// Bad
<div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
```

---

## 6. Checklist Before Commit

- [ ] Page is a Server Component (or justified Client Component)
- [ ] Client Components have `'use client'` and delegate logic to a hook
- [ ] Forms use react-hook-form + zod schemas from `lib/validators/`
- [ ] No business logic in `.tsx` files
- [ ] No hardcoded arrays/strings — they live in `constants/`
- [ ] No interfaces/types inline — they live in `types/`
- [ ] No `any`, no `console.log`
- [ ] Components are reusable and accept props
- [ ] Server-only modules guarded with `server-only`
- [ ] `npm run lint` passes
