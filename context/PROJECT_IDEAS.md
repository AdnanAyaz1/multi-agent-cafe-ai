# Production App Requirements

## Core Product

An AI-powered business intelligence platform for cafes. Subscribes get daily AI recommendations on what to promote and discount based on weather, competitors, and menu analysis.

## User Flow

### 1. Signup & Onboarding
- Cafe owner creates account (email/password or OAuth)
- Selects subscription plan (Free tier, Pro, Enterprise)
- Provides business details: name, location, timezone
- Connects menu source (JSON upload or DB credentials)
- Optionally adds competitor URLs for monitoring

### 2. Menu Management
- Upload menu items (name, category, price, description)
- Support bulk CSV/JSON upload
- Edit individual items inline
- Category management (drinks, food, desserts, etc.)
- Price history tracking

### 3. AI Analysis Pipeline
- Background cron jobs fetch weather + scrape competitors
- 5-agent pipeline runs daily:
  - Menu Analyst → Weather Analyst → Strategist → Critic → Synthesizer
- Results stored in DB with full audit trail

### 4. Price Change Workflow
- **Auto-approve**: Changes ≤10% of current price
- **Human review**: Changes >10% require owner approval
- Review queue with approve/reject buttons
- Notification system (email, in-app)

### 5. Dashboard & History
- Today's recommendation with top actions
- Suggestion detail modal (full reasoning from each agent)
- Complete log/history of all recommendations
- Apply/dismiss tracking for learning
- Charts: weather vs. sales correlation, recommendation outcomes

### 6. Subscription Management
- Plan features (analysis frequency, competitor count, etc.)
- Usage tracking (API calls, storage)
- Upgrade/downgrade flow
- Payment integration (Stripe)

## Feature Priority

| Priority | Feature | Status |
|---|---|---|
| P0 | Auth/subscription flow | Pending |
| P0 | Menu upload/management | Pending |
| P0 | Price threshold logic (≤10% auto, >10% review) | Pending |
| P1 | Suggestion history + detail modal | Pending |
| P1 | Log/history viewer | Pending |
| P1 | Notification system | Pending |
| P2 | Stripe payment integration | Pending |
| P2 | Multi-cafe admin panel | Pending |
| P3 | Mobile app (React Native) | Deferred |

## Technical Constraints

- No `any` types anywhere
- Strict separation of concerns (hooks, utils, constants, types)
- All components must be dynamic (props-driven, no hardcoded content)
- Each component in its own file
- Server Components by default, Client Components only when needed
