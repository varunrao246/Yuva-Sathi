# YUVA SATHI — Evaluator Guide (2-Minute Walkthrough)

Welcome, Hackathon Evaluator! This document provides a rapid, high-impact walkthrough of **YUVA SATHI (युवा साथी)**.

---

## 🚀 Quick Links for Evaluators

- 🌐 **Live Web Application:** [https://yuva-sathi-three.vercel.app](https://yuva-sathi-three.vercel.app)
- 🤖 **Telegram Bot:** [@YuvaSathi_bot](https://t.me/YuvaSathi_bot)
- 🩺 **Live Integration Health Endpoint:** [https://yuva-sathi-three.vercel.app/api/integrations/status](https://yuva-sathi-three.vercel.app/api/integrations/status)
- 💻 **GitHub Repository:** [https://github.com/varunrao246/yuva-sathi](https://github.com/varunrao246/yuva-sathi)

---

## ⏱️ The 2-Minute Feature Tour

### 1. Zero-Setup Demo Sandbox (First 30 Seconds)
Open [https://yuva-sathi-three.vercel.app](https://yuva-sathi-three.vercel.app). The app opens immediately in **Demo Sandbox Mode** pre-loaded with a realistic Indian college student profile (*Rohan Sharma, Computer Science, PES University*).
- Notice the **Safe-to-Spend Today** metric (`₹410/day`).
- Notice the **Days Remaining in Cycle** (Day 22 of 30 • 9 days left).
- Notice the **Credit Dues Reserved** insight banner: upcoming credit card dues are automatically quarantined so you never incur credit card interest charges.

### 2. "Before You Buy" Decision Simulator (Next 30 Seconds)
1. Click **"My Money"** in the top navigation bar, then select the **"Before You Buy"** tab.
2. Enter an intended purchase (e.g. `₹850` for *Instamart Groceries* or `₹2,500` for *Concert Tickets*).
3. Click **"Check Affordability"**.
4. Observe the instant impact analysis:
   - Evaluates whether the expense dips into upcoming mess/rent reserves.
   - Shows the projected new daily safe-to-spend figure.
   - Automatically surfaces verified student coupons (e.g. Spotify Student, Apple UNiDAYS).

### 3. Scholarships & Gigs Opportunity Hubs (Next 30 Seconds)
1. Click **"Scholarships"** in the top navigation bar.
2. Filter by **Government** vs **Private** schemes.
3. Observe grant amounts in INR, eligibility criteria, and direct links to official `.gov.in` and trust portals.
4. Test the **Application Status Tracker** (`Saved` $\rightarrow$ `Applying` $\rightarrow$ `Applied` $\rightarrow$ `Awarded`).
5. Click **"Opportunities"** to browse flexible student roles (Chegg Subject Expert, Internshala, Karya Indic Audio) with verified hourly/monthly stipends.

### 4. AI & Voice Money Coach (Final 30 Seconds)
1. Click **"AI Coach"** in the navigation bar.
2. Select a suggested prompt: *"Can I buy this today?"* or *"Give me a weekly budget"*.
3. Notice how the response is **strictly grounded** in Rohan's exact live balance (`₹6,726`) and safe daily spend (`₹410/day`). The AI never hallucinates arbitrary numbers.
4. Click the **Microphone** icon to test the voice assistant with Indic speech recognition.

---

## 📋 Rubric Evidence Mapping

| Hackathon Criterion | Engineering Implementation | Direct Source Evidence |
| :--- | :--- | :--- |
| **1. Code Quality** | Modular Next.js 14 App Router, strict TypeScript models, zero `any` types in core domain, decomposed sub-dialogs, DRY navigation helpers. | [`src/types/index.ts`](file:///Users/apple/Desktop/Yuva%20Sathi/src/types/index.ts)<br/>[`src/components/savings/`](file:///Users/apple/Desktop/Yuva%20Sathi/src/components/savings/) |
| **2. Security** | Server-side API key isolation, Row-Level Security SQL policies in PostgreSQL, 5 MB audio buffer guards, IP sliding-window rate limiters. | [`src/app/api/`](file:///Users/apple/Desktop/Yuva%20Sathi/src/app/api/)<br/>[`supabase/schema.sql`](file:///Users/apple/Desktop/Yuva%20Sathi/supabase/schema.sql) |
| **3. Efficiency** | Sub-second Vitest runs (124ms), concurrent `Promise.all` cloud fetching, storage event batching (`setStoredItems`), memoized calculations (`useMemo`). | [`src/lib/storage.ts`](file:///Users/apple/Desktop/Yuva%20Sathi/src/lib/storage.ts)<br/>[`src/lib/supabase/db.ts`](file:///Users/apple/Desktop/Yuva%20Sathi/src/lib/supabase/db.ts) |
| **4. Testing** | 39 automated tests across 7 suites covering financial arithmetic, currency formatting, scholarships, opportunities, Supabase, and Telegram. | [`src/__tests__/`](file:///Users/apple/Desktop/Yuva%20Sathi/src/__tests__/) |
| **5. Accessibility** | High-contrast forest-and-cream palette, semantic HTML elements, ARIA labels on icon buttons, touchscreen-accessible mobile delete buttons. | [`src/components/`](file:///Users/apple/Desktop/Yuva%20Sathi/src/components/) |
| **6. Problem Statement Alignment** | Specifically built for Indian college students: handles lump-sum pocket money, campus chai/canteen pacing, mess dues, scholarships, and flexible student gigs. | Full application |

---

## 🛠️ Verification Commands for Evaluators

```bash
# 1. Run the test suite (all 39 tests pass in ~125ms)
npm run test

# 2. Verify strict TypeScript compilation (0 errors)
npx tsc --noEmit

# 3. Verify production build
npm run build
```
