# YUVA SATHI — Testing Documentation & Strategy

YUVA SATHI adheres to a strict test-driven strategy prioritizing deterministic financial arithmetic, data transformation integrity, type safety, and external integration resilience.

---

## 1. Running the Test Suite

The test runner is powered by **Vitest** for sub-second execution speeds.

```bash
# Run all 39 unit and integration tests
npm run test

# Run tests in watch mode for development
npx vitest

# Run a specific test suite
npx vitest run src/__tests__/calculations.test.ts
```

---

## 2. Test Suite Breakdown (7 Suites, 39 Tests)

| Test Suite | File Path | Tests | Coverage Scope |
| :--- | :--- | :---: | :--- |
| **Financial Calculations** | [`src/__tests__/calculations.test.ts`](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/calculations.test.ts) | **13** | Available balance, Safe-to-Spend-Today, burn rates, zero-income handling, negative balance resilience, month-end linear forecasting, and discretionary buffer calculation. |
| **Currency Formatting** | [`src/__tests__/currency.test.ts`](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/currency.test.ts) | **7** | Indian Rupee Lakh/Crore grouping rules (`formatINR`), symbol preservation (`₹`), decimal truncation, and date formatting. |
| **Scholarships Filter & Schema** | [`src/__tests__/scholarships.test.ts`](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/scholarships.test.ts) | **3** | Catalog integrity, Government vs Private filtering, required fields validation, and official portal URLs. |
| **Opportunities Hub** | [`src/__tests__/opportunities.test.ts`](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/opportunities.test.ts) | **3** | Student gig verification, compensation format checks, remote-only filters, and skill tagging. |
| **Supabase DB Mapper** | [`src/__tests__/supabase-db.test.ts`](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/supabase-db.test.ts) | **3** | Relational mapping between snake_case PostgreSQL schema and camelCase TypeScript models, RLS security compatibility. |
| **Telegram Bot Companion** | [`src/__tests__/telegram.test.ts`](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/telegram.test.ts) | **5** | Single-use token generation, 15-minute expiration enforcement, command parsing (`/balance`, `/today`, `/budget`), and message formatting. |
| **Architecture & Remediation** | [`src/__tests__/code-quality-remediation.test.ts`](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/code-quality-remediation.test.ts) | **5** | `isNavTabActive` navigation grouping, AI coach precision regex query matching, and false-positive prevention ("weekend" / "weak"). |

---

## 3. Financial Calculation Invariants Tested

The 13 calculation tests in `calculations.test.ts` verify mathematical invariants that can never be violated:
1. **Safe-to-Spend Bound:** `safeToSpendToday` can never exceed the discretionary buffer divided by days remaining.
2. **Credit Dues Quarantine:** `creditCardTotalDue` is subtracted from liquid funds before computing safe-to-spend.
3. **Savings Allocation Cap:** Savings goal contributions are capped at 30% of monthly surplus to prevent student cashflow starvation.
4. **Zero & Negative Income:** The engine gracefully reports `₹0/day` and activates `critical` pacing without throwing runtime divide-by-zero exceptions.

---

## 4. Continuous Quality Checks

In addition to Vitest, code quality is validated via two automated gates:
```bash
# TypeScript strict type checking
npx tsc --noEmit

# Production Next.js build compilation
npm run build
```
Both gates execute with **0 errors and 0 warnings**.
