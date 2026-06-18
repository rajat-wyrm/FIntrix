# Fintrix

All-in-one deal-flow, lead intelligence, and AI copilot platform for investors and operators.

- **Backend:** Node.js (Express) + Prisma + PostgreSQL (Neon) + Redis (Upstash) + Socket.IO
- **Frontend:** React 19 + Vite 7 + Tailwind v4 (UI/UX preserved from the original design)
- **AI:** Multi-provider fallback chain (Groq → Gemini → OpenAI → DeepSeek → HuggingFace) with deterministic template fallbacks
- **Blockchain:** Web3/Ethers ready (Sepolia) with safe mock fallback when RPC is not configured

---

## Quick start

```bash
# 1. Backend
cd backend
npm install
npx prisma generate
npx prisma db push          # sync schema to Neon (already done)
node seed/seedOrgTypes.js   # seed org types
npm start                   # http://0.0.0.0:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
# OR for production preview
npm run build && npm run preview -- --host 0.0.0.0 --port 4173
```

## Environment

`backend/.env` is already configured with production secrets (Neon DB, Upstash Redis, AI provider keys, Stripe, Cloudinary, etc.). The provider keys in the env are the originals you provided; if they are expired/invalid, the AI layer **degrades gracefully** to a built-in template fallback so the API never returns 500.

`frontend/.env` points the SPA to `http://localhost:5000` (backend) and `http://localhost:5000` (socket).

## API surface (registered in `backend/app.js`)

| Route | Description |
| --- | --- |
| `GET  /` | Health banner |
| `GET  /api/health` | DB + service liveness |
| `POST /api/auth/register` | Register (with role) |
| `POST /api/auth/login` | Email/password login |
| `GET  /api/auth/me` | Current user (protected) |
| `POST /api/auth/forgot-password` | Reset link via email |
| `POST /api/auth/reset-password` | Apply reset |
| `POST /api/auth/send-otp` | Email OTP |
| `POST /api/auth/verify-otp` | Verify email OTP |
| `GET  /api/users` | Admin: list users |
| `PATCH /api/users/me` | Update self |
| `GET  /api/admin/dashboard` | Admin: dashboard |
| `POST /api/admin/login` | Admin login |
| `GET  /api/organizations` | List orgs (paginated) |
| `POST /api/organizations` | Create org |
| `GET  /api/organizations/:id` | Org detail |
| `PATCH /api/organizations/:id` | Update org |
| `DELETE /api/organizations/:id` | Delete org |
| `GET  /api/leads` | List leads |
| `POST /api/leads` | Create lead |
| `GET  /api/analytics/global` | Global stats |
| `GET  /api/analytics/me` | My analytics |
| `GET  /api/analytics/insights` | AI insights |
| `GET  /api/notifications` | My notifications |
| `PATCH /api/notifications/:id/read` | Mark read |
| `POST /api/email-search` | Verify + log email |
| `GET  /api/email-search` | Search history |
| `POST /api/domain-search` | DNS + WHOIS + log |
| `GET  /api/domain-search` | Search history |
| `POST /api/social-search` | Parse social URL |
| `POST /api/ai/recommend` | Lead recommendations |
| `POST /api/ai/outreach` | Outreach message |
| `POST /api/ai/summarize` | Summarize text |
| `GET  /api/blockchain/transactions` | List on-chain records |
| `POST /api/blockchain/store` | Store hash on chain |
| `GET  /api/blockchain/stats` | Stats |
| `GET  /api/deals` | List deals |
| `POST /api/deals` | Create deal |
| `PATCH /api/deals/:id` | Update deal |
| `DELETE /api/deals/:id` | Delete deal |
| `POST /api/webhooks/incoming` | Inbound webhook (HMAC) |
| `GET  /api/integrations/hubspot/leads` | HubSpot integration |
| `POST /api/integrations/hubspot/leads` | Push to HubSpot |
| `GET  /api/integrations/salesforce/leads` | Salesforce integration |
| `POST /api/integrations/sync/hubspot-to-salesforce` | Sync |
| `WS   /socket.io` | Real-time (JWT auth) |

## Performance & resilience

- `trust proxy` set so `req.ip` works behind a reverse proxy
- Helmet hardened with `crossOriginEmbedderPolicy: false`
- In-memory + optional Redis rate limiter
- `slowDown` middleware for high-traffic IPs
- Prisma client singleton (no connection leaks)
- Graceful SIGINT/SIGTERM shutdown for HTTP, Socket.IO, Prisma
- ISO-timestamped leveled logger (`utils/logger.js`)
- AI provider chain: tries each configured provider in order, caches successes in Redis for 60s, returns deterministic templates when all providers fail

## What changed from the original codebase

- Renamed top-level folder `final` → `Fintrix`
- New `.env` with **freshly generated** JWT, refresh, CSRF, API, session, and encryption keys
- Generated Prisma client for Linux (was Windows binary)
- Reset Neon schema and applied the Fintrix Prisma schema
- Removed dead/duplicate files (`auth/auth.js`, `routes/auth.js`, `middleware/auth.js`, empty `src/*` placeholders, Python cache, zip archives)
- Registered missing route groups in `app.js`: AI, blockchain, deals, webhooks, integrations
- Replaced broken AI client with unified `services/aiProvider.js` (fallback chain) + `services/cacheService.js` (Upstash REST)
- Replaced broken email-search / domain-search GET endpoints (now return paginated history)
- Fixed deal validation to match the Prisma enums
- Fixed `blockchainController.js` double Prisma init
- Hardened `webhookRoutes.js` (no missing `node-fetch` import) and `integrationRoutes.js` (correct auth middleware)
- Added Socket.IO factory (`config/socket.js`) with JWT auth handshake and per-user rooms
- New cron-driven followup job with idempotency
- Helmet/trust-proxy/CORS tuning

**UI/UX was not touched** — every frontend change is bug-fix-only.
