# Changelog

All notable changes to the **YUVA SATHI (युवा साथी)** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-22

### Added
- **Core Financial Engine:**
  - Pure, deterministic calculation engine in `src/lib/calculations.ts` computing available balance, safe-to-spend today, daily budgets, spending pace, and month-end linear forecast.
  - Indian currency formatter (`formatINR`) implementing Lakh/Crore grouping rules and symbol preservation.
  - Quarantined credit dues algorithm protecting daily funds from upcoming card payments.
- **My Money Hub:**
  - Unified financial management interface combining expenses, commitments, credit dues, and merchant offers.
  - Before You Buy simulator evaluating discretionary impact before spending.
  - Expense CRUD ledger with category, date, payment method, and amount tracking.
  - Recurring commitments timeline tracking mess fees, rent, and recharges with essential/optional tagging.
- **Student Opportunity & Growth Suite:**
  - Dedicated Scholarships Hub with 8 verified Indian schemes, filters (Government, Private, Education Level), application status tracker, and direct links to official `.gov.in` portals.
  - Dedicated Opportunities Hub featuring verified student gigs, internships, remote student roles, compensation rates, and required skills.
- **AI Financial Money Coach:**
  - Google Gemini integration grounded with deterministic financial context.
  - Rate-limited server API route with sliding-window protection and 8s timeout.
  - Deterministic Local Rule Engine fallback providing offline responses without external API calls.
- **Voice Financial Coach:**
  - Dual-engine speech architecture with Gnani.ai API support and HTML5 Web Speech fallback.
  - Ambient Web Speech TypeScript declarations (`ISpeechRecognition`).
- **Telegram Financial Bot:**
  - Bot companion (`@YuvaSathi_bot`) supporting `/balance`, `/today`, `/budget`, and `/savings` commands.
  - Single-use 15-minute token authentication flow.
- **Cloud Persistence & Auth:**
  - Supabase integration with Row-Level Security SQL schema for 5 core domain tables.
  - Dual-namespaced LocalStorage engine with isolated demo sandbox for zero-setup evaluator walkthroughs.
- **Code Quality Remediation:**
  - Parallelized Supabase cloud data fetching via `Promise.all`.
  - Storage event batching (`setStoredItems`) preventing cascading re-render storms.
  - Memoized `calculateFinancials` in `useYuvaStore`.
  - Extracted `CreateGoalModal` and `DepositGoalModal` from `SavingsManager`.
  - Extracted shared `isNavTabActive` navigation predicate.
  - Created `useCopyToClipboard` custom hook with timer cleanup on unmount.
  - Added unit test suite `code-quality-remediation.test.ts` bringing total test coverage to 39 tests across 7 suites.

### Security
- Verified zero exposed credentials in repository history.
- Added 5 MB payload guard on voice audio buffer upload route.
- Rate-limited AI coach route (20 requests/min per IP).
- Header secret verification for Telegram webhook endpoints.
