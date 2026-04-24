# Architecture

Fintrix is a two-tier monorepo.

## Backend (`/backend`)

- **Runtime:** Node.js 20, Express 4
- **DB:** PostgreSQL 16 (Neon in production) via Prisma 6
- **Cache:** Upstash Redis REST (no SDK, just `fetch`)
- **Realtime:** Socket.IO with JWT handshake, per-user rooms
- **Auth:** bcrypt + JWT (15m access, 7d refresh in `.env`); role-based authorization
- **AI:** Multi-provider chain (groq → gemini → openai → deepseek → huggingface) with deterministic template fallback
- **Background jobs:** node-cron (`followupJob`) — idempotent, safe Prisma wrappers
- **Validation:** Joi schemas in `/validations`
- **Logging:** ISO-timestamped leveled logger in `/utils/logger.js`

### Layered structure

```
routes/         Express routers, one per resource
controllers/    HTTP handlers, shape req/res, hand off to services
services/       Business logic (AI, notifications, scoring, cache)
middleware/     Cross-cutting (auth, rate-limit, errors, validation)
config/         Singletons (Prisma, Socket.IO, blockchain)
jobs/           Cron tasks
utils/          Pure helpers (logger, retry, email, ai health)
test/           node:test suites
prisma/         Schema + migrations
```

## Frontend (`/frontend`)

- **Build:** Vite 7, Tailwind v4 (via `@tailwindcss/vite`)
- **Routing:** React Router 7 with route-level guards
- **State:** Local component state + React Query for server cache
- **Theme:** `ThemeContext` provider (light/dark) backed by `localStorage`
- **Auth:** Token stored in `localStorage`, attached via an axios-style client
- **Realtime:** Socket.IO client (lazy-connected once authenticated)

## Data model (Prisma)

See `backend/prisma/schema.prisma`. Core entities:

- `User` (ADMIN | STARTUP | INVESTOR)
- `Organization`
- `Lead` (with embedded `engagement` JSON and scoring)
- `Deal` ↔ `DealStartup` ↔ `DealInvestor`
- `EmailSearch` / `DomainSearch` (history)
- `Notification` (per-user, type, link, metadata JSON)
- `AnalyticsEvent` (per-user event log)
- `ActivityLog` (per-user, per-entity action log)
- `BlockchainTransaction` (data hash + tx hash + status)
- `OrganizationType`, `Tag`
