# YUVA SATHI — EVALUATOR EVIDENCE & CODE MAPPING

This document provides empirical code evidence and architectural mapping across the six evaluation parameters of the **Hack2Skill** framework.

**Live Application:** [https://yuva-sathi-three.vercel.app](https://yuva-sathi-three.vercel.app)  
**Live Integrations Status:** [https://yuva-sathi-three.vercel.app/api/integrations/status](https://yuva-sathi-three.vercel.app/api/integrations/status)  
**Telegram Bot:** [@YuvaSathi_bot](https://t.me/YuvaSathi_bot)

---

## 1. Code Quality

### Architectural Principles:
- **Modular Directory Architecture:** Distinct separation between presentation components (`src/components`), server endpoints (`src/app/api`), pure mathematical logic (`src/lib/calculations.ts`), data stores (`src/lib/storage.ts`), and strict TypeScript models (`src/types/index.ts`).
- **Strict Typing:** All data models are strictly defined in `src/types/index.ts`. No `any` type escapes in core business logic.
- **Client/Server Separation:** Server-only code (Google Gemini API, Supabase server client, Telegram bot webhook dispatcher, voice proxies) is strictly isolated from browser components.
- **Resilient Hydration:** Storage hook `useYuvaStore` uses an `isLoaded` flag to prevent SSR hydration flash.

### Direct File Evidence:
- Type Definitions: [src/types/index.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/types/index.ts)
- Pure Calculations Engine: [src/lib/calculations.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/lib/calculations.ts)
- Isolated State Store: [src/lib/storage.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/lib/storage.ts)
- Unified My Money Hub: [src/components/money/MyMoneyHub.tsx](file:///Users/apple/Desktop/Yuva%20Sathi/src/components/money/MyMoneyHub.tsx)
- Transaction Manager (CRUD): [src/components/transactions/TransactionManager.tsx](file:///Users/apple/Desktop/Yuva%20Sathi/src/components/transactions/TransactionManager.tsx)
- Scholarships Explorer: [src/components/scholarships/ScholarshipsExplorer.tsx](file:///Users/apple/Desktop/Yuva%20Sathi/src/components/scholarships/ScholarshipsExplorer.tsx)
- Opportunities Explorer: [src/components/opportunities/OpportunitiesExplorer.tsx](file:///Users/apple/Desktop/Yuva%20Sathi/src/components/opportunities/OpportunitiesExplorer.tsx)

---

## 2. Security

### Safeguards Implemented:
- **Server-Side API Keys:** Private credentials (`GEMINI_API_KEY`, `TELEGRAM_BOT_TOKEN`, `GNANI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are accessed strictly inside server API routes (`src/app/api/`). They are never bundled into client JavaScript.
- **Zero Banking Credential Collection:** Yuva Sathi never asks for bank account numbers, passwords, card CVVs, full card numbers, or UPI PINs.
- **Row-Level Security (RLS):** Supabase database schema enforces RLS policies on 100% of tables (`profiles`, `transactions`, `commitments`, `savings_goals`, `credit_cards`, `telegram_links`). Every policy enforces `auth.uid() = user_id`.
- **Sandbox Isolation:** LocalStorage demo mode (`appMode: 'demo'`) and user mode (`appMode: 'user'`) use separate storage keys. Demo interactions never contaminate real user data.
- **Input Sanitization & Rate Limiting:** AI Coach inputs are capped at 500 characters with non-printable characters stripped. The route enforces an IP sliding-window limit (20 req/min).
- **Telegram Token Security:** Account linking uses cryptographically secure tokens (`ys_` + 16 hex chars) with a strict 15-minute expiration timestamp.

### Direct File Evidence:
- AI Coach Security & Rate Limiter: [src/app/api/coach/route.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/app/api/coach/route.ts#L7-L55)
- Telegram Link Token Security: [src/lib/telegram.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/lib/telegram.ts#L40-L75)
- PostgreSQL Row-Level Security: [supabase/schema.sql](file:///Users/apple/Desktop/Yuva%20Sathi/supabase/schema.sql#L153-L261)
- Demo/User Storage Isolation: [src/lib/storage.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/lib/storage.ts#L39-L60)

---

## 3. Efficiency

### Empirical Measurements:
- **Sub-Millisecond Math:** All budget allocations, safe-to-spend today distributions, and purchase affordability checks execute in pure local TypeScript with zero external network latency.
- **Lightweight Bundle:** Shared First Load JS across all routes is only **87.2 kB**.
- **No Unnecessary Polling:** Local updates use window storage events and reactive Next.js server routes.
- **Total Codebase Under 1 MB:** Total application source code is **872 KB** (excluding `node_modules` and `.next`), well below the 10 MB hackathon ceiling.

### Direct File Evidence:
- Local Math Engine: [src/lib/calculations.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/lib/calculations.ts#L19-L184)
- Currency Formatting: [src/lib/currency.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/lib/currency.ts)
- Next.js Build Trace: Compiled in 6 seconds (11/11 routes).

---

## 4. Testing

### Verified Test Suite:
34 automated unit and integration tests executing in ~130ms using Vitest:

```bash
$ npm run test

 RUN  v5.1.1 /Users/apple/Desktop/Yuva Sathi

 ✓ src/__tests__/scholarships.test.ts   (3 tests) 2ms
 ✓ src/__tests__/opportunities.test.ts  (3 tests) 3ms
 ✓ src/__tests__/supabase-db.test.ts     (3 tests) 4ms
 ✓ src/__tests__/currency.test.ts       (7 tests) 3ms
 ✓ src/__tests__/calculations.test.ts   (13 tests) 14ms
 ✓ src/__tests__/telegram.test.ts       (5 tests) 2ms

 Test Files  6 passed (6)
      Tests  34 passed (34)
   Duration  130ms
```

### Verified Test Cases:
1. Standard INR number grouping (`₹500`, `₹8,500`, `₹1,25,000`).
2. Zero, null, undefined, and NaN formatting safety.
3. Negative amount formatting (`-₹500`, `-₹12,500`).
4. Compact Indian denominations (`₹5k`, `₹1.5 L`, `₹2.5 Cr`).
5. Decimal formatting when requested (`₹499.50`).
6. Indian Date DD MMM YYYY formatting (`22 Nov 2026`).
7. Indian Date empty/invalid input fallback handling.
8. Total monthly income calculation (pocket money + other inflow).
9. Current month transaction isolation (filters out previous months).
10. Essential commitments & credit card dues isolation from daily buffer.
11. Active savings goals monthly reserve allocation.
12. Zero income edge case (returns ₹0 without NaN or zero-division).
13. Overspending / negative balance detection with `critical` spending pace alert.
14. Month boundary (1 day remaining).
15. Empty data resilience (no exceptions on empty arrays).
16. ₹100 purchase simulation (Comfortable).
17. ₹1,000 purchase simulation (within buffer).
18. Purchase exceeding discretionary cushion (Risky).
19. Zero purchase handling.
20. Invalid / NaN purchase amount handling.
21. Scholarships dataset authenticity (verified portals, INR amounts, criteria).
22. Government vs Private scholarship filtering.
23. Central schemes presence (NSP Central Sector, AICTE Pragati).
24. Part-time opportunities integrity (verified INR compensation, study hours, valid links).
25. Work type distribution (Campus, Remote, Internship, Freelance).
26. Flexible student-friendly hours verification.
27. Cryptographically secure, 15-minute expiring Telegram linking tokens.
28. Telegram account linking verification.
29. Rejection of invalid/tampered Telegram tokens.
30. Clean account disconnect via `/disconnect`.
31. Grounded financial snapshot extraction for Telegram bot commands.
32. Supabase schema to frontend type mapping.
33. Cloud profile persistence handler.
34. Cloud transaction CRUD sync handler.

### Direct File Evidence:
- [src/__tests__/calculations.test.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/calculations.test.ts)
- [src/__tests__/currency.test.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/currency.test.ts)
- [src/__tests__/scholarships.test.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/scholarships.test.ts)
- [src/__tests__/opportunities.test.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/opportunities.test.ts)
- [src/__tests__/telegram.test.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/telegram.test.ts)
- [src/__tests__/supabase-db.test.ts](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/supabase-db.test.ts)

---

## 5. Accessibility

### Practices Implemented:
- **WCAG High Contrast:** Forest green (`#143E2B`) and charcoal text (`#0F172A`) against warm ivory (`#FAF7F0`) achieve a contrast ratio $> 7:1$ (exceeding WCAG AA requirements).
- **Semantic HTML:** Explicit `<header>`, `<main>`, `<aside>`, `<nav>`, and `<button>` elements.
- **Form Controls:** Every form input is wrapped with descriptive text or paired with explicit `aria-label` attributes.
- **Mobile Touch Targets:** Action buttons and navigation pills maintain touch targets $\ge 44 \times 44$ px.
- **Screen Reader Announcements:** Dynamic alerts use `role="alert"` and chat logs use `role="log" aria-live="polite"`.

### Direct File Evidence:
- Accessible Navigation Header: [src/components/layout/Header.tsx](file:///Users/apple/Desktop/Yuva%20Sathi/src/components/layout/Header.tsx)
- Accessible Mobile Bar: [src/components/layout/MobileNav.tsx](file:///Users/apple/Desktop/Yuva%20Sathi/src/components/layout/MobileNav.tsx)
- Accessible Scholarships Search: [src/components/scholarships/ScholarshipsExplorer.tsx](file:///Users/apple/Desktop/Yuva%20Sathi/src/components/scholarships/ScholarshipsExplorer.tsx#L156-L180)
- Accessible Opportunities Search: [src/components/opportunities/OpportunitiesExplorer.tsx](file:///Users/apple/Desktop/Yuva%20Sathi/src/components/opportunities/OpportunitiesExplorer.tsx#L132-L155)

---

## 6. Problem Statement Alignment

| Problem Statement Need | Yuva Sathi Implementation | Evidence Code Path |
| :--- | :--- | :--- |
| **Manage money & expenses** | Real-time income & expense tracking, category breakdown, spending pace alerts | `src/components/dashboard/FinancialPulse.tsx` |
| **Safe-to-spend clarity** | Proactive daily spend limit after quarantining upcoming essential bills and savings | `src/lib/calculations.ts#L125-L130` |
| **Savings goals** | Interactive savings targets with progress bars and monthly reserve allocation | `src/components/savings/SavingsManager.tsx` |
| **Scholarships** | 8 verified Indian schemes (NSP, AICTE, Reliance, Tata) with 4-stage tracker | `src/components/scholarships/ScholarshipsExplorer.tsx` |
| **Part-time opportunities** | 8 student gigs & internships with verified INR compensation & flexible hours | `src/components/opportunities/OpportunitiesExplorer.tsx` |
| **Practical & simple** | Restrained fintech UI, zero financial jargon, 60-second time-to-value | `src/components/layout/Header.tsx` |

---

## 7. Limitations & Disclosures

1. **Curated Static Datasets:** Scholarship and opportunity listings are curated authentic datasets with static deadline references; students must use the official links provided for live applications.
2. **AI Advice:** The AI Money Coach provides educational budgeting context and should not be construed as registered financial advisory.
3. **Database Cloud Sync:** Requires the user to execute `supabase/schema.sql` once in their Supabase project to instantiate remote PostgreSQL tables.
