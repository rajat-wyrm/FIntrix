# Changelog

All notable changes to Fintrix are documented in the git history. This file is
a curated overview of the major milestones.

## 1.0.0 — 2026-06-18

### Highlights
- Renamed project from `quintern` to **Fintrix**.
- Generated fresh secrets (JWT access/refresh, CSRF, API key, session, encryption).
- Regenerated Prisma client for Linux, reset Neon schema, seeded 10 organization types.
- Unified AI provider service with full Groq → Gemini → OpenAI → DeepSeek → HuggingFace fallback and deterministic template degradation.
- Added Socket.IO with JWT handshake, per-user rooms, and per-IP connection throttling.
- Added Upstash Redis cache layer for AI responses (60s TTL) and rate limiter.
- Added followup cron job with idempotency.
- Registered all 10 resource route groups in `app.js`.
- Hardened Helmet, CORS, trust proxy, and graceful shutdown.
- CI workflow runs syntax check + unit tests + Prisma integration test + frontend build.
