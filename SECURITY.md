# Security Policy

**YUVA SATHI (युवा साथी)** treats application security, student financial privacy, and external credential protection as top priorities.

---

## Reporting a Vulnerability

If you discover a security vulnerability or credential exposure in YUVA SATHI, please disclose it responsibly.

- **Private Reporting:** Please open a confidential security advisory via GitHub Advisories or email the maintainer directly at the contact address on [GitHub](https://github.com/varunrao246).
- **Please do not report security issues via public GitHub issues.**
- We will acknowledge your report within 48 hours and work toward a verified fix before public disclosure.

---

## Security Architecture & Best Practices

### 1. Secret & Key Isolation
- All private API keys and tokens (`GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `GNANI_API_KEY`) reside exclusively on the server in `.env.local` (strictly ignored by Git).
- No server-side secrets or private tokens are prefixed with `NEXT_PUBLIC_` or bundled into client-side JavaScript.
- Repository commit history is scanned and verified to contain zero exposed credentials.

### 2. Client/Server API Boundaries
- External third-party APIs (Google Gemini, Telegram Bot API, Gnani.ai) are accessed exclusively via Next.js server-side route handlers (`src/app/api/`).
- The browser never communicates directly with third-party AI or notification endpoints, preventing token theft and CORS tampering.

### 3. Database Access & Row-Level Security (RLS)
- Supabase PostgreSQL tables (`profiles`, `transactions`, `commitments`, `savings_goals`, `credit_cards`) enforce Row-Level Security policies.
- Authenticated users can only read and mutate rows where `user_id = auth.uid()`.
- Client requests utilize the restricted public anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`), ensuring PostgreSQL RLS prevents unauthorized data access across accounts.

### 4. Input Sanitization & Payload Bounds
- All server endpoints validate incoming payloads:
  - AI Coach queries: Sanitized of control characters and capped at 500 characters. Sliding-window in-memory rate limiting enforces 20 requests per minute per IP.
  - Voice STT: Enforces an explicit 5 MB upper bound on uploaded audio buffers to prevent memory exhaustion.
  - Webhooks: Telegram webhook endpoint verifies the `X-Telegram-Bot-Api-Secret-Token` header.

### 5. Deterministic Arithmetic Guardrails
- Financial calculations (`safeToSpendToday`, `currentBalance`, `discretionaryFunds`) are executed by a pure deterministic TypeScript engine (`src/lib/calculations.ts`).
- AI models receive computed figures as read-only context and are strictly prohibited from calculating or altering financial values, eliminating financial hallucinations.
