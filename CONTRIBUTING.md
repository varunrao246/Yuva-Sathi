# Contributing to YUVA SATHI (युवा साथी)

Thank you for your interest in contributing to **YUVA SATHI**! We welcome contributions that make financial management simpler, more practical, and more accessible for college students.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, constructive, and collaborative in all interactions.

---

## Development Setup

### Prerequisites
- **Node.js:** v18.17.0 or higher (v20+ recommended)
- **Package Manager:** `npm` (v9+)
- **Git**

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/varunrao246/yuva-sathi.git
   cd yuva-sathi
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   *Note: All external cloud services (Supabase, Gemini AI, Gnani.ai, Telegram) feature deterministic local fallbacks. The application runs and tests with 100% functionality even without API keys.*

4. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Coding Conventions

- **TypeScript:** Strict mode is enforced. Avoid `any` or `as any`. Use discriminated unions and domain models from `src/types/index.ts`.
- **Architecture & Boundaries:**
  - `src/lib/calculations.ts` contains pure, deterministic math. Financial formulas must remain deterministic; AI must never invent balances or calculations.
  - Server-only code (external APIs, webhooks, database clients) must reside in `src/app/api/` or `src/lib/` and never leak to client components.
- **Styling:** Use Tailwind CSS following the project design system:
  - Deep Forest Green (`#143E2B`, `forest-*`)
  - Warm Ivory / Cream (`#FAF7F0`, `#F5F0E5`, `cream-*`)
  - Muted Lime Accent (`lime-400`, `lime-500`)
  - Slate & Charcoal typography (`#1F2937`, `charcoal-*`)
- **Accessibility:** Always include `aria-label` or accessible names for icon-only buttons, maintain high color contrast ratios, and ensure keyboard navigation works smoothly.

---

## Testing & Quality Verification

Before submitting changes, ensure all verification suites pass:

```bash
# 1. Run unit and integration tests
npm run test

# 2. Run TypeScript strict typecheck
npx tsc --noEmit

# 3. Verify production build
npm run build
```

---

## Contribution Workflow

1. Fork the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes in small, focused, well-documented commits.
3. Write or update unit tests in `src/__tests__/` where appropriate.
4. Verify that all tests pass, TypeScript compiler reports zero errors, and `npm run build` succeeds.
5. Push your branch to your fork and submit a Pull Request against `main`.
6. Describe what changes were made, the problem solved, and how to verify it.
