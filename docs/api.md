# API Reference

Base URL: `http://localhost:5000` (override with `PORT` and `HOST`).

All responses follow `{ "success": bool, "data"?, "message"?, "pagination"? }`.

## Auth

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a user (role: ADMIN / STARTUP / INVESTOR) |
| POST | `/api/auth/login` | Email + password login → `{ token, user }` |
| GET  | `/api/auth/me` | Current user (Bearer token) |
| POST | `/api/auth/forgot-password` | Send reset link |
| POST | `/api/auth/reset-password` | Apply reset (single-use token) |
| POST | `/api/auth/send-otp` | Email OTP (60s cooldown) |
| POST | `/api/auth/verify-otp` | Verify OTP, returns token on full registration |

## Users

| Method | Path | Description |
| --- | --- | --- |
| GET    | `/api/users` | Admin only — list users |
| GET    | `/api/users/:id` | Admin only — user by id |
| GET    | `/api/users/me` | Current user |
| PATCH  | `/api/users/me` | Update name / mobile |

## Organizations

| Method | Path |
| --- | --- |
| GET    | `/api/organizations` (paginated, search, type filter) |
| POST   | `/api/organizations` |
| GET    | `/api/organizations/:id` |
| PATCH  | `/api/organizations/:id` |
| DELETE | `/api/organizations/:id` |

## Leads

| Method | Path |
| --- | --- |
| GET    | `/api/leads` |
| POST   | `/api/leads` (auto-scores) |
| GET    | `/api/leads/:id` |
| PATCH  | `/api/leads/:id` |
| DELETE | `/api/leads/:id` |

## Deals

| Method | Path |
| --- | --- |
| GET    | `/api/deals` |
| POST   | `/api/deals` |
| GET    | `/api/deals/:id` |
| PATCH  | `/api/deals/:id` |
| DELETE | `/api/deals/:id` |

## Analytics

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/analytics/global` | Platform-wide rollup |
| GET | `/api/analytics/me` | Current user activity |
| GET | `/api/analytics/insights` | AI-generated insights |

## Notifications

| Method | Path |
| --- | --- |
| GET    | `/api/notifications` |
| PATCH  | `/api/notifications/:id/read` |
| PATCH  | `/api/notifications/read-all` |
| DELETE | `/api/notifications/:id` |

## Search tools

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/email-search` | DNS-based deliverability check |
| GET  | `/api/email-search` | History (paginated) |
| POST | `/api/domain-search` | WHOIS + DNS A/MX/NS |
| GET  | `/api/domain-search` | History |
| POST | `/api/social-search` | Parse social URL, log event |

## AI

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/ai/recommend` | Lead recommendations |
| POST | `/api/ai/outreach` | Outreach message |
| POST | `/api/ai/summarize` | Summarize text |

## Blockchain

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/blockchain/store` | Hash + record on chain |
| GET  | `/api/blockchain/fetch/:id` | Read by record id |
| GET  | `/api/blockchain/transactions` | List |
| GET  | `/api/blockchain/transaction/:hash` | By hash |
| GET  | `/api/blockchain/stats` | Stats |

## Webhooks & integrations

| Method | Path |
| --- | --- |
| POST | `/api/webhooks/incoming` (HMAC signed) |
| GET/POST | `/api/integrations/hubspot/leads` |
| GET/POST | `/api/integrations/salesforce/leads` |
| POST | `/api/integrations/sync/hubspot-to-salesforce` |

## Realtime

`WS /socket.io` — JWT via `auth.token` or `Authorization: Bearer …`.

Events:

- `notification:new` — broadcast to the recipient's room
- `lead:updated` — emit to `user:<ownerId>`
