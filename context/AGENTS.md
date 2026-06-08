# Agent Instructions

## Breaking Changes Warning

This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

---

## Separation of Concerns Rules (Mandatory)

| Concern | Lives in |
| --- | --- |
| Data fetching, async work | **Page** (Server Component) |
| UI layout & composition | **Page / Component** |
| State + event handlers | **Client Component** |
| State *logic* (useState, useEffect, reducers) | **Reusable hook** (`hooks/`) |
| Pure business logic / calculations | **`utils/`** |
| Constants, enums, magic strings | **`constants/`** |
| Raw shadcn primitives | **`components/ui/`** (shadcn output) |
| Composed, reusable UI blocks | **`components/`** |
| TypeScript interfaces/types | **`types/`** |

**Hard rules:**
- No `any` types anywhere in the codebase
- No constants, interfaces, or functions inside component/page files
- Each component must have its own file
- All components must accept props (dynamic), no hardcoded content
- `'use client'` only on files that use hooks or event handlers
- No business logic in `.tsx` files
- No hardcoded arrays/strings — they live in `constants/`
- Server-only modules guarded with `server-only`
- No `console.log` in production paths — use `utils/logger.ts`

---

## Commit Checklist

Before any commit, verify:
- [ ] Page is a Server Component (or justified Client Component)
- [ ] Client Components have `'use client'` and delegate logic to a hook
- [ ] No business logic in `.tsx` files
- [ ] No hardcoded arrays/strings — they live in `constants/`
- [ ] No `any`, no `console.log` left behind
- [ ] Server-only modules are guarded with `server-only`
- [ ] `npm run lint` passes
