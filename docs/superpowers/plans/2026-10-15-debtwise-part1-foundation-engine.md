# Debtwise Implementation Plan, Part 1: Foundation and Engine

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Part 2 (`2026-10-15-debtwise-part2-app.md`) continues from Task 7. Do Part 1 first.

**Goal:** Build the project skeleton, the tested money engine, sample data and the Supabase schema for Debtwise.

**Architecture:** A Vite React TypeScript PWA. All money logic is pure TypeScript functions in `src/engine` with unit tests. Data access goes through a `DataStore` interface (Part 2) with a Supabase implementation. AI calls go through Vercel serverless functions in `api/` (Part 2).

**Tech Stack:** React, TypeScript, Vite, vite-plugin-pwa, react-router-dom, zustand, @supabase/supabase-js, Vitest, Vercel functions, Gemini API, ElevenLabs.

**Spec:** `docs/superpowers/specs/2026-10-15-debtwise-design.md`. UI rules: `DESIGN.md`.

## Global Constraints

- Working folder: `C:\Users\LENOVO\Documents\Lieutenant Hecker\Primary Data\AI\Coding\Website - Debtwise`. Do not read or write outside it, except to run commands from it.
- Fresh code only. Do not copy code from `Program - Axiom`, `Program - Taskmaster` or other projects.
- Palette is exactly: Palladian `#EEE9DF`, Oatmeal `#C9C1B1`, Blue Fantastic `#2C3B4D`, Abyssal `#1B2632`, Burning Flame `#FFB162`, Truffle `#A35139`. No other hues. No pure white text. Light theme only.
- One font weight (400) everywhere. No bold, no all caps, no em dash in any text or code comment shown to users.
- Text colours follow `DESIGN.md` section 2 (Abyssal on light, Palladian on dark).
- Money figures are computed only in `src/engine`. The AI never computes money.
- Browser code uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never put a `service_role` key or an AI key in `src/`. Never print `.env.local`.
- Sample data is always labelled `sample` in the UI.
- All user-facing text lives in `src/i18n` in both Thai and English.
- Wording: say what the numbers show. Never write `safe` or `you should`.
- Tests: `npm test` must pass before every commit. `npm run typecheck` must pass before every commit from Task 7 on.
- Commit after every task with the message given in the task.

## Review Focus

1. Income of zero or negative: the plan returns a shortfall and never `NaN` (Task 2).
2. A debt with `ratePct` null (informal): treated as 0% for ordering, never crashes (Task 2).
3. A refinance offer with a longer term shows a smaller payment but a higher total: `worthIt` is false and `longerTerm` is true (Task 3).
4. A refinance with `termMonthsLeft` of 0 or less: throws a clear error, not `Infinity` (Task 3).
5. Thai national ID written with dashes, a phone number inside Thai text, and a known name are all masked (Task 1).
6. An invalid date string returns an empty string, not `Invalid Date` (Task 1).
7. An AI reply that mentions a money figure the engine never produced is flagged (Task 4).
8. Retirement year earlier than the current year: the tax and profile code must not divide by zero or go negative (Part 2, Task 10).

---

## File structure (whole project)

```
Website - Debtwise/
  index.html
  package.json  tsconfig.json  vite.config.ts  vercel.json
  .env.example  .env.local  .gitignore
  README.md  CODEMAP.md  DESIGN.md
  api/                         Vercel functions (Part 2)
    ai.ts  tts.ts  stt.ts
    _lib/auth.ts  _lib/providers.ts  _lib/prompts.ts
  supabase/migrations/0001_init.sql
  src/
    main.tsx  App.tsx  vite-env.d.ts
    styles/tokens.css  styles/base.css
    engine/                    pure functions with *.test.ts beside each
      types.ts  format.ts  mask.ts  cashflow.ts  plan.ts
      refinance.ts  tax.ts  deductions.ts  guard.ts  index.ts
    data/sample/               tokenomist.ts  taxRules.ts  offers.ts  demoFamily.ts
    store/                     types.ts  supabaseStore.ts  index.ts  useApp.ts
    lib/                       supabase.ts  ai.ts  voice.ts
    i18n/                      en.ts  th.ts  index.tsx  i18n.test.ts
    components/                Icon.tsx  Shell.tsx  BottomNav.tsx  TopBar.tsx
                               StackedBar.tsx  Badge.tsx  Field.tsx  Stepper.tsx
                               Sheet.tsx  StatTile.tsx  Row.tsx
    screens/                   SignIn  Onboarding  Home  Invest  Tax  Debt
                               DebtGroup  LoanDetail  AddDebt  Review  Plan
                               Talk  Profile
```

---

### Task 0: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`, `src/engine/smoke.test.ts`
- Modify: `.gitignore` (already exists, leave as is)

**Interfaces:**
- Produces: `npm run dev`, `npm test`, `npm run typecheck`, `npm run build`.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "debtwise",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install react react-dom react-router-dom zustand @supabase/supabase-js
npm install -D vite @vitejs/plugin-react typescript vitest vite-plugin-pwa @types/react @types/react-dom @types/node @vercel/node
```
Expected: install completes with no errors. Do not pin versions by hand.

- [ ] **Step 3: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "types": ["vite/client", "node"]
  },
  "include": ["src", "api", "vite.config.ts"]
}
```

- [ ] **Step 4: Write `vite.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts', 'api/**/*.test.ts'] },
})
```
(The PWA plugin is added in Part 2, Task 17.)

- [ ] **Step 5: Write `index.html`**

```html
<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#EEE9DF" />
    <title>Debtwise</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Write `src/vite-env.d.ts` and `src/main.tsx`**

`src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />
```

`src/main.tsx`:
```tsx
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(<p>Debtwise</p>)
```

- [ ] **Step 7: Write the smoke test `src/engine/smoke.test.ts`**

```ts
import { expect, test } from 'vitest'

test('test runner works', () => {
  expect(1 + 1).toBe(2)
})
```

- [ ] **Step 8: Run checks**

Run: `npm test` then `npm run typecheck` then `npm run build`
Expected: all three succeed.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React TypeScript project with Vitest"
```
Do not add `.env.local` (it is in `.gitignore`). Run `git status` and confirm `.env.local` is not listed.

---

### Task 1: Engine types, format and mask

**Files:**
- Create: `src/engine/types.ts`, `src/engine/format.ts`, `src/engine/mask.ts`, `src/engine/format.test.ts`, `src/engine/mask.test.ts`
- Delete: `src/engine/smoke.test.ts`

**Interfaces:**
- Produces:
  - `type DebtType = 'credit_card' | 'personal' | 'car' | 'home' | 'student' | 'informal'`
  - `type DebtStatus = 'verified' | 'needs_review' | 'user_stated'`
  - `interface Debt { id: string; lender: string; type: DebtType; label: string; balance: number; ratePct: number | null; minPayment: number; dueDay: number | null; termMonthsLeft: number | null; status: DebtStatus; sourceId: string | null }`
  - `type Lang = 'th' | 'en'`
  - `formatBaht(n: number): string`
  - `formatDate(iso: string, lang: Lang): string`
  - `mask(text: string, names?: string[]): string`

- [ ] **Step 1: Write `src/engine/types.ts`**

```ts
export type DebtType = 'credit_card' | 'personal' | 'car' | 'home' | 'student' | 'informal'
export type DebtStatus = 'verified' | 'needs_review' | 'user_stated'
export type Lang = 'th' | 'en'

export interface Debt {
  id: string
  lender: string
  type: DebtType
  label: string
  balance: number
  ratePct: number | null
  minPayment: number
  dueDay: number | null
  termMonthsLeft: number | null
  status: DebtStatus
  sourceId: string | null
}
```

- [ ] **Step 2: Write the failing tests**

`src/engine/format.test.ts`:
```ts
import { expect, test } from 'vitest'
import { formatBaht, formatDate } from './format'

test('formatBaht groups thousands and drops decimals from 100 up', () => {
  expect(formatBaht(1234567)).toBe('฿ 1,234,567')
  expect(formatBaht(1234.56)).toBe('฿ 1,235')
})
test('formatBaht keeps up to two decimals under 100', () => {
  expect(formatBaht(45.5)).toBe('฿ 45.5')
})
test('formatBaht puts the minus sign first', () => {
  expect(formatBaht(-1500)).toBe('-฿ 1,500')
})
test('formatBaht treats NaN as zero', () => {
  expect(formatBaht(NaN)).toBe('฿ 0')
})
test('formatDate uses Buddhist era in Thai and Gregorian in English', () => {
  expect(formatDate('2026-10-15', 'th')).toContain('2569')
  expect(formatDate('2026-10-15', 'en')).toContain('2026')
})
test('formatDate returns empty string for invalid input', () => {
  expect(formatDate('not a date', 'th')).toBe('')
  expect(formatDate('', 'en')).toBe('')
})
```

`src/engine/mask.test.ts`:
```ts
import { expect, test } from 'vitest'
import { mask } from './mask'

test('masks a Thai national ID with dashes', () => {
  expect(mask('ID 1-2345-67890-12-3 ok')).toBe('ID [id] ok')
})
test('masks a 13 digit ID without dashes', () => {
  expect(mask('1234567890123')).toBe('[id]')
})
test('masks a phone number inside Thai text', () => {
  expect(mask('โทร 081-234-5678 ได้เลย')).toBe('โทร [phone] ได้เลย')
})
test('masks a bank account number', () => {
  expect(mask('acct 123-4-56789-0')).toBe('acct [account]')
  expect(mask('acct 1234567890')).toBe('acct [account]')
})
test('masks known names, case insensitive, including regex characters', () => {
  expect(mask('สมชาย โอนเงิน', ['สมชาย'])).toBe('[name] โอนเงิน')
  expect(mask('Hello Ann (B.)', ['ann (b.)'])).toBe('Hello [name]')
})
test('leaves ordinary text and money amounts alone', () => {
  expect(mask('balance 85,000 baht at 16%')).toBe('balance 85,000 baht at 16%')
})
test('ignores empty or one letter names', () => {
  expect(mask('a b c', ['', 'a'])).toBe('a b c')
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/engine/format.test.ts src/engine/mask.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 4: Write `src/engine/format.ts`**

```ts
import type { Lang } from './types'

export function formatBaht(n: number): string {
  const v = Number.isFinite(n) ? n : 0
  const digits = Math.abs(v) >= 100 ? 0 : 2
  const body = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: digits })
  return `${v < 0 ? '-' : ''}฿ ${body}`
}

export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso)
  if (!iso || Number.isNaN(d.getTime())) return ''
  const locale = lang === 'th' ? 'th-TH-u-ca-buddhist' : 'en-GB'
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d)
}
```

- [ ] **Step 5: Write `src/engine/mask.ts`**

```ts
const RULES: [RegExp, string][] = [
  [/\b\d-?\d{4}-?\d{5}-?\d{2}-?\d\b/g, '[id]'],
  [/\b0\d{1,2}-?\d{3}-?\d{4}\b/g, '[phone]'],
  [/\b\d{3}-?\d-?\d{5}-?\d\b/g, '[account]'],
  [/\b\d{10,16}\b/g, '[account]'],
]

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function mask(text: string, names: string[] = []): string {
  let out = text
  for (const [re, label] of RULES) out = out.replace(re, label)
  for (const name of names) {
    if (name.trim().length < 2) continue
    out = out.replace(new RegExp(escape(name.trim()), 'gi'), '[name]')
  }
  return out
}
```

- [ ] **Step 6: Delete the smoke test, run tests, expect PASS**

Run: `git rm -f src/engine/smoke.test.ts` then `npx vitest run`
Expected: PASS. If a mask test fails because of regex order, fix the regex, not the test.

- [ ] **Step 7: Commit**

```bash
git add src/engine
git commit -m "feat(engine): add types, baht and date formatting, text masking"
```

---

### Task 2: Cash flow and plan

**Files:**
- Create: `src/engine/cashflow.ts`, `src/engine/plan.ts`, `src/engine/plan.test.ts`

**Interfaces:**
- Consumes: `Debt` from `src/engine/types.ts`
- Produces:
  - `cashflow(i: CashflowInput): Cashflow` with `CashflowInput { monthlyIncome: number; otherIncome: number; essentials: number; taxSetAside: number; minimums: number }` and `Cashflow { available: number; leftAfterMinimums: number; shortfall: number }`
  - `buildPlan(debts: Debt[], available: number): PlanResult` with `Allocation { debtId: string; amount: number; reason: 'minimum' | 'partial_minimum' | 'extra' | 'unpaid' }` and `PlanResult { allocations: Allocation[]; shortfall: number; leftover: number; available: number }`
  - `payoffMonths(balance: number, ratePct: number, payment: number): number | null`

- [ ] **Step 1: Write the failing tests `src/engine/plan.test.ts`**

```ts
import { expect, test } from 'vitest'
import { cashflow } from './cashflow'
import { buildPlan, payoffMonths } from './plan'
import type { Debt } from './types'

const d = (id: string, rate: number | null, balance: number, min: number): Debt => ({
  id, lender: 'L', type: 'personal', label: id, balance, ratePct: rate, minPayment: min,
  dueDay: 1, termMonthsLeft: null, status: 'verified', sourceId: null,
})

test('cashflow with room left', () => {
  const c = cashflow({ monthlyIncome: 40000, otherIncome: 0, essentials: 25000, taxSetAside: 1000, minimums: 9000 })
  expect(c).toEqual({ available: 14000, leftAfterMinimums: 5000, shortfall: 0 })
})
test('cashflow with a shortfall', () => {
  const c = cashflow({ monthlyIncome: 40000, otherIncome: 0, essentials: 35000, taxSetAside: 1000, minimums: 9000 })
  expect(c).toEqual({ available: 4000, leftAfterMinimums: -5000, shortfall: 5000 })
})
test('cashflow with zero or negative income never returns NaN', () => {
  const c = cashflow({ monthlyIncome: 0, otherIncome: NaN, essentials: 10000, taxSetAside: 0, minimums: 3000 })
  expect(Number.isNaN(c.available)).toBe(false)
  expect(c.shortfall).toBe(13000)
})

test('plan gives extra money to the highest rate debt', () => {
  const p = buildPlan([d('A', 20, 10000, 500), d('B', 5, 50000, 1000)], 3000)
  const a = Object.fromEntries(p.allocations.map((x) => [x.debtId, x]))
  expect(a.A.amount).toBe(2000)
  expect(a.A.reason).toBe('extra')
  expect(a.B.amount).toBe(1000)
  expect(a.B.reason).toBe('minimum')
  expect(p.shortfall).toBe(0)
  expect(p.leftover).toBe(0)
})
test('plan never pays more than the balance and reports leftover', () => {
  const p = buildPlan([d('A', 20, 600, 500)], 5000)
  expect(p.allocations[0].amount).toBe(600)
  expect(p.leftover).toBe(4400)
})
test('plan covers minimums by rate order when money is short', () => {
  const p = buildPlan([d('A', 20, 10000, 500), d('B', 5, 50000, 1000)], 1000)
  const a = Object.fromEntries(p.allocations.map((x) => [x.debtId, x]))
  expect(a.A.amount).toBe(500)
  expect(a.A.reason).toBe('minimum')
  expect(a.B.amount).toBe(500)
  expect(a.B.reason).toBe('partial_minimum')
  expect(p.shortfall).toBe(500)
})
test('plan with no money marks everything unpaid', () => {
  const p = buildPlan([d('A', 20, 10000, 500)], -200)
  expect(p.allocations[0]).toEqual({ debtId: 'A', amount: 0, reason: 'unpaid' })
  expect(p.shortfall).toBe(500)
})
test('plan treats a null rate as zero and does not crash', () => {
  const p = buildPlan([d('inf', null, 3000, 1000), d('B', 5, 50000, 1000)], 2000)
  expect(p.allocations.map((x) => x.debtId)).toEqual(['B', 'inf'])
})

test('payoffMonths for zero rate', () => {
  expect(payoffMonths(1000, 0, 100)).toBe(10)
})
test('payoffMonths returns null when the payment never clears interest', () => {
  expect(payoffMonths(100000, 24, 1000)).toBeNull()
})
test('payoffMonths for an ordinary loan', () => {
  expect(payoffMonths(100000, 12, 3500)).toBe(34)
})
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npx vitest run src/engine/plan.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Write `src/engine/cashflow.ts`**

```ts
export interface CashflowInput {
  monthlyIncome: number
  otherIncome: number
  essentials: number
  taxSetAside: number
  minimums: number
}
export interface Cashflow {
  available: number
  leftAfterMinimums: number
  shortfall: number
}

const n = (x: number) => (Number.isFinite(x) ? x : 0)

export function cashflow(i: CashflowInput): Cashflow {
  const available = n(i.monthlyIncome) + n(i.otherIncome) - n(i.essentials) - n(i.taxSetAside)
  const leftAfterMinimums = available - n(i.minimums)
  return { available, leftAfterMinimums, shortfall: Math.max(0, -leftAfterMinimums) }
}
```

- [ ] **Step 4: Write `src/engine/plan.ts`**

```ts
import type { Debt } from './types'

export interface Allocation {
  debtId: string
  amount: number
  reason: 'minimum' | 'partial_minimum' | 'extra' | 'unpaid'
}
export interface PlanResult {
  allocations: Allocation[]
  shortfall: number
  leftover: number
  available: number
}

const rate = (d: Debt) => d.ratePct ?? 0

export function buildPlan(debts: Debt[], available: number): PlanResult {
  const sorted = [...debts].sort((a, b) => rate(b) - rate(a))
  let pool = Math.max(0, Number.isFinite(available) ? available : 0)
  const paid = new Map<string, number>()
  let shortfall = 0

  for (const d of sorted) {
    const due = Math.min(d.minPayment, d.balance)
    const pay = Math.min(due, pool)
    paid.set(d.id, pay)
    pool -= pay
    shortfall += due - pay
  }
  for (const d of sorted) {
    const add = Math.min(d.balance - (paid.get(d.id) ?? 0), pool)
    paid.set(d.id, (paid.get(d.id) ?? 0) + add)
    pool -= add
  }

  const allocations: Allocation[] = sorted.map((d) => {
    const amount = paid.get(d.id) ?? 0
    const due = Math.min(d.minPayment, d.balance)
    let reason: Allocation['reason'] = 'minimum'
    if (amount === 0 && due > 0) reason = 'unpaid'
    else if (amount < due) reason = 'partial_minimum'
    else if (amount > due) reason = 'extra'
    return { debtId: d.id, amount, reason }
  })
  return { allocations, shortfall, leftover: pool, available }
}

export function payoffMonths(balance: number, ratePct: number, payment: number): number | null {
  if (payment <= 0 || balance <= 0) return null
  const r = ratePct / 1200
  if (r === 0) return Math.ceil(balance / payment)
  if (payment <= balance * r) return null
  return Math.ceil(-Math.log(1 - (r * balance) / payment) / Math.log(1 + r))
}
```

- [ ] **Step 5: Run to verify PASS**

Run: `npx vitest run src/engine/plan.test.ts`
Expected: PASS (11 tests). If `payoffMonths(100000, 12, 3500)` differs by one month, recompute by hand with the formula and fix the expected value only if the formula in `payoffMonths` matches `n = -ln(1 - r*B/P) / ln(1+r)` rounded up.

- [ ] **Step 6: Commit**

```bash
git add src/engine
git commit -m "feat(engine): cash flow, repayment plan and payoff estimate"
```

---

### Task 3: Refinance calculator

**Files:**
- Create: `src/engine/refinance.ts`, `src/engine/refinance.test.ts`

**Interfaces:**
- Produces:
  - `annuity(principal: number, ratePct: number, months: number): number`
  - `interface Offer { id: string; bank: string; ratePct: number; termMonths: number; fee: number; penalty: number; insuranceMonthly: number }`
  - `interface RefinanceResult { currentPayment: number; newPayment: number; currentTotal: number; newTotal: number; saving: number; worthIt: boolean; termChangeMonths: number; longerTerm: boolean }`
  - `refinance(input: { balance: number; currentRatePct: number; termMonthsLeft: number; offer: Offer }): RefinanceResult` (throws `Error('termMonthsLeft must be above 0')`)

- [ ] **Step 1: Write the failing tests**

```ts
import { expect, test } from 'vitest'
import { annuity, refinance, type Offer } from './refinance'

const offer = (o: Partial<Offer> = {}): Offer => ({
  id: 'o', bank: 'Sample Bank', ratePct: 8, termMonths: 36, fee: 0, penalty: 0, insuranceMonthly: 0, ...o,
})

test('annuity with zero rate splits evenly', () => {
  expect(annuity(1200, 0, 12)).toBe(100)
})
test('annuity for a standard loan', () => {
  expect(annuity(100000, 18, 36)).toBeCloseTo(3615.1, 0)
})
test('a cheaper offer with the same term saves money', () => {
  const r = refinance({ balance: 100000, currentRatePct: 18, termMonthsLeft: 36, offer: offer() })
  expect(r.saving).toBeGreaterThan(17000)
  expect(r.saving).toBeLessThan(17700)
  expect(r.worthIt).toBe(true)
  expect(r.longerTerm).toBe(false)
})
test('fees and penalty can wipe out the saving', () => {
  const r = refinance({ balance: 100000, currentRatePct: 9, termMonthsLeft: 36, offer: offer({ ratePct: 8, fee: 3000, penalty: 2000 }) })
  expect(r.worthIt).toBe(false)
  expect(r.saving).toBeLessThan(0)
})
test('insurance cost is counted over the whole new term', () => {
  const base = refinance({ balance: 100000, currentRatePct: 18, termMonthsLeft: 36, offer: offer() })
  const withIns = refinance({ balance: 100000, currentRatePct: 18, termMonthsLeft: 36, offer: offer({ insuranceMonthly: 100 }) })
  expect(base.saving - withIns.saving).toBeCloseTo(3600, 5)
})
test('a longer term lowers the payment but is flagged and not worth it when total cost rises', () => {
  const r = refinance({ balance: 100000, currentRatePct: 8, termMonthsLeft: 24, offer: offer({ ratePct: 8, termMonths: 60 }) })
  expect(r.newPayment).toBeLessThan(r.currentPayment)
  expect(r.longerTerm).toBe(true)
  expect(r.termChangeMonths).toBe(36)
  expect(r.worthIt).toBe(false)
})
test('zero or negative remaining term throws a clear error', () => {
  expect(() => refinance({ balance: 1000, currentRatePct: 5, termMonthsLeft: 0, offer: offer() })).toThrow('termMonthsLeft must be above 0')
})
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npx vitest run src/engine/refinance.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Write `src/engine/refinance.ts`**

```ts
export interface Offer {
  id: string
  bank: string
  ratePct: number
  termMonths: number
  fee: number
  penalty: number
  insuranceMonthly: number
}
export interface RefinanceResult {
  currentPayment: number
  newPayment: number
  currentTotal: number
  newTotal: number
  saving: number
  worthIt: boolean
  termChangeMonths: number
  longerTerm: boolean
}

export function annuity(principal: number, ratePct: number, months: number): number {
  const r = ratePct / 1200
  if (r === 0) return principal / months
  return (principal * r) / (1 - Math.pow(1 + r, -months))
}

export function refinance(input: {
  balance: number
  currentRatePct: number
  termMonthsLeft: number
  offer: Offer
}): RefinanceResult {
  const { balance, currentRatePct, termMonthsLeft, offer } = input
  if (!(termMonthsLeft > 0)) throw new Error('termMonthsLeft must be above 0')
  const currentPayment = annuity(balance, currentRatePct, termMonthsLeft)
  const currentTotal = currentPayment * termMonthsLeft
  const newPayment = annuity(balance, offer.ratePct, offer.termMonths)
  const newTotal =
    newPayment * offer.termMonths + offer.insuranceMonthly * offer.termMonths + offer.fee + offer.penalty
  const saving = currentTotal - newTotal
  return {
    currentPayment,
    newPayment,
    currentTotal,
    newTotal,
    saving,
    worthIt: saving > 0,
    termChangeMonths: offer.termMonths - termMonthsLeft,
    longerTerm: offer.termMonths > termMonthsLeft,
  }
}
```

- [ ] **Step 4: Run to verify PASS**

Run: `npx vitest run`
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): refinance net saving calculator"
```

---

### Task 4: Tax estimate, deductions and the figure guard

**Files:**
- Create: `src/engine/tax.ts`, `src/engine/deductions.ts`, `src/engine/guard.ts`, `src/engine/index.ts`, `src/engine/tax.test.ts`, `src/engine/guard.test.ts`

**Interfaces:**
- Produces:
  - `const SAMPLE_TAX_YEAR = 2569` and `TAX_RULES_LABEL = 'sample'` (the rules are sample data until verified against the Revenue Department)
  - `estimateTax(i: { annualIncome: number; kind: 'salary' | 'freelance'; allowances: number }): TaxEstimate` with `TaxEstimate { taxableIncome: number; tax: number; marginalRate: number; assumptions: string[] }`
  - `const DEDUCTIONS: Deduction[]` with `Deduction { id: string; maxAmount: number; label: { th: string; en: string }; paperwork: { th: string; en: string }; ruleRef: string }`
  - `suggestDeductions(marginalRate: number): { deduction: Deduction; estimatedSaving: number }[]`
  - `findUnknownFigures(reply: string, allowed: number[]): string[]`
  - `src/engine/index.ts` re-exports everything public from the engine.

- [ ] **Step 1: Write the failing tests**

`src/engine/tax.test.ts`:
```ts
import { expect, test } from 'vitest'
import { estimateTax } from './tax'
import { suggestDeductions } from './deductions'

test('salary 600,000 with only the personal allowance gives 21,500', () => {
  const t = estimateTax({ annualIncome: 600000, kind: 'salary', allowances: 0 })
  expect(t.taxableIncome).toBe(440000)
  expect(t.tax).toBe(21500)
  expect(t.marginalRate).toBe(0.1)
})
test('income under the exempt band pays nothing', () => {
  const t = estimateTax({ annualIncome: 200000, kind: 'salary', allowances: 0 })
  expect(t.tax).toBe(0)
})
test('extra allowances reduce taxable income and never go below zero', () => {
  const t = estimateTax({ annualIncome: 100000, kind: 'salary', allowances: 500000 })
  expect(t.taxableIncome).toBe(0)
  expect(t.tax).toBe(0)
})
test('freelance income uses the same bands and lists its assumption', () => {
  const t = estimateTax({ annualIncome: 600000, kind: 'freelance', allowances: 0 })
  expect(t.assumptions.length).toBeGreaterThan(0)
  expect(t.tax).toBeGreaterThan(0)
})
test('non finite or negative income is treated as zero', () => {
  expect(estimateTax({ annualIncome: NaN, kind: 'salary', allowances: 0 }).tax).toBe(0)
  expect(estimateTax({ annualIncome: -5, kind: 'salary', allowances: 0 }).tax).toBe(0)
})
test('suggested saving equals max amount times marginal rate', () => {
  const s = suggestDeductions(0.1)
  expect(s.length).toBeGreaterThan(3)
  for (const x of s) expect(x.estimatedSaving).toBeCloseTo(x.deduction.maxAmount * 0.1, 5)
})
test('no suggestions are generated at a zero marginal rate', () => {
  expect(suggestDeductions(0).every((x) => x.estimatedSaving === 0)).toBe(true)
})
```

`src/engine/guard.test.ts`:
```ts
import { expect, test } from 'vitest'
import { findUnknownFigures } from './guard'

test('figures that the engine produced pass', () => {
  expect(findUnknownFigures('You owe 12,500 baht in 2026.', [12500])).toEqual([])
})
test('a figure the engine never produced is flagged', () => {
  expect(findUnknownFigures('This saves 99,999 baht.', [12500])).toEqual(['99,999'])
})
test('small numbers, percentages and years are ignored', () => {
  expect(findUnknownFigures('In 36 months at 8% by 2569.', [])).toEqual([])
})
test('a tolerance of one baht is allowed', () => {
  expect(findUnknownFigures('about 12,501', [12500])).toEqual([])
})
test('a 4 digit amount with a comma is checked', () => {
  expect(findUnknownFigures('pay 2,000 now', [])).toEqual(['2,000'])
})
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npx vitest run src/engine/tax.test.ts src/engine/guard.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Write `src/engine/tax.ts`**

```ts
export const SAMPLE_TAX_YEAR = 2569
export const TAX_RULES_LABEL = 'sample'

export interface TaxEstimate {
  taxableIncome: number
  tax: number
  marginalRate: number
  assumptions: string[]
}

// Sample progressive bands. Verify against the Revenue Department before showing as fact.
const BANDS: { upTo: number; rate: number }[] = [
  { upTo: 150000, rate: 0 },
  { upTo: 300000, rate: 0.05 },
  { upTo: 500000, rate: 0.1 },
  { upTo: 750000, rate: 0.15 },
  { upTo: 1000000, rate: 0.2 },
  { upTo: 2000000, rate: 0.25 },
  { upTo: 5000000, rate: 0.3 },
  { upTo: Infinity, rate: 0.35 },
]
const PERSONAL_ALLOWANCE = 60000
const EXPENSE_CAP = 100000

export function estimateTax(i: { annualIncome: number; kind: 'salary' | 'freelance'; allowances: number }): TaxEstimate {
  const income = Number.isFinite(i.annualIncome) ? Math.max(0, i.annualIncome) : 0
  const extra = Number.isFinite(i.allowances) ? Math.max(0, i.allowances) : 0
  const expenses = Math.min(income * 0.5, EXPENSE_CAP)
  const taxableIncome = Math.max(0, income - expenses - PERSONAL_ALLOWANCE - extra)

  let tax = 0
  let lower = 0
  let marginalRate = 0
  for (const b of BANDS) {
    if (taxableIncome > lower) {
      tax += (Math.min(taxableIncome, b.upTo) - lower) * b.rate
      marginalRate = b.rate
    }
    lower = b.upTo
  }
  const assumptions = [
    `Sample rules for tax year ${SAMPLE_TAX_YEAR}, not verified.`,
    'Standard expense deduction of 50% of income, capped at 100,000.',
    'Personal allowance of 60,000.',
  ]
  if (i.kind === 'freelance') assumptions.push('Freelance income may use different expense rules. Check the income category.')
  return { taxableIncome, tax: Math.round(tax), marginalRate, assumptions }
}
```

- [ ] **Step 4: Write `src/engine/deductions.ts`**

```ts
export interface Deduction {
  id: string
  maxAmount: number
  label: { th: string; en: string }
  paperwork: { th: string; en: string }
  ruleRef: string
}

// Sample list. Amounts and rules must be verified against the Revenue Department before showing as fact.
export const DEDUCTIONS: Deduction[] = [
  { id: 'spouse', maxAmount: 60000, label: { th: 'ค่าลดหย่อนคู่สมรส', en: 'Spouse allowance' }, paperwork: { th: 'ทะเบียนสมรส', en: 'Marriage certificate' }, ruleRef: 'sample' },
  { id: 'child', maxAmount: 30000, label: { th: 'ค่าลดหย่อนบุตร (ต่อคน)', en: 'Child allowance (per child)' }, paperwork: { th: 'สูติบัตร', en: 'Birth certificate' }, ruleRef: 'sample' },
  { id: 'parents', maxAmount: 30000, label: { th: 'ค่าเลี้ยงดูบิดามารดา (ต่อคน)', en: 'Parent support (per parent)' }, paperwork: { th: 'สำเนาบัตรประชาชนของบิดามารดา', en: 'Parent ID copy' }, ruleRef: 'sample' },
  { id: 'social_security', maxAmount: 9000, label: { th: 'เงินสมทบประกันสังคม', en: 'Social security contribution' }, paperwork: { th: 'หนังสือรับรองจากสำนักงานประกันสังคม', en: 'Social Security Office statement' }, ruleRef: 'sample' },
  { id: 'life_insurance', maxAmount: 100000, label: { th: 'เบี้ยประกันชีวิต', en: 'Life insurance premium' }, paperwork: { th: 'ใบรับรองเบี้ยประกัน', en: 'Premium certificate' }, ruleRef: 'sample' },
  { id: 'home_loan_interest', maxAmount: 100000, label: { th: 'ดอกเบี้ยเงินกู้ซื้อที่อยู่อาศัย', en: 'Home loan interest' }, paperwork: { th: 'หนังสือรับรองดอกเบี้ยจากธนาคาร', en: 'Bank interest certificate' }, ruleRef: 'sample' },
]

export function suggestDeductions(marginalRate: number) {
  const rate = Number.isFinite(marginalRate) ? Math.max(0, marginalRate) : 0
  return DEDUCTIONS.map((deduction) => ({ deduction, estimatedSaving: deduction.maxAmount * rate }))
}
```

- [ ] **Step 5: Write `src/engine/guard.ts`**

```ts
export function findUnknownFigures(reply: string, allowed: number[]): string[] {
  const out: string[] = []
  for (const m of reply.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    const raw = m[0].replace(/[.,]+$/, '')
    const n = parseFloat(raw.replace(/,/g, ''))
    if (!Number.isFinite(n) || n < 1000) continue
    const hasComma = raw.includes(',')
    const yearLike = !hasComma && /^\d{4}$/.test(raw) && ((n >= 1900 && n <= 2100) || (n >= 2500 && n <= 2700))
    if (yearLike) continue
    if (!allowed.some((a) => Math.abs(a - n) <= 1)) out.push(raw)
  }
  return out
}
```

- [ ] **Step 6: Write `src/engine/index.ts`**

```ts
export * from './types'
export * from './format'
export * from './mask'
export * from './cashflow'
export * from './plan'
export * from './refinance'
export * from './tax'
export * from './deductions'
export * from './guard'
```

- [ ] **Step 7: Run all tests and typecheck, expect PASS**

Run: `npm test` then `npm run typecheck`
Expected: PASS. If the 21,500 test fails, recompute: income 600000, expenses 100000, allowance 60000, taxable 440000, tax 7500 + 14000 = 21500. Fix the code, not the number.

- [ ] **Step 8: Commit**

```bash
git add src/engine
git commit -m "feat(engine): tax estimate, deduction suggestions and AI figure guard"
```

---

### Task 5: Sample data and demo family

**Files:**
- Create: `src/data/sample/tokenomist.ts`, `src/data/sample/taxRules.ts`, `src/data/sample/offers.ts`, `src/data/sample/demoFamily.ts`, `src/data/sample/demoFamily.test.ts`

**Interfaces:**
- Consumes: `Debt`, `cashflow`, `buildPlan`, `Offer` from `src/engine`
- Produces:
  - `SampleLabel = { sourceLabel: string; sourceUrl: string; asOf: string }`
  - `TOKEN_EVENTS: TokenEvent[]`
  - `OFFERS: (Offer & SampleLabel & { forTypes: DebtType[] })[]`
  - `DEMO_PROFILE` and `DEMO_DEBTS: Omit<Debt, 'id' | 'sourceId'>[]`

- [ ] **Step 1: Write the failing test `src/data/sample/demoFamily.test.ts`**

```ts
import { expect, test } from 'vitest'
import { cashflow, buildPlan } from '../../engine'
import { DEMO_DEBTS, DEMO_PROFILE } from './demoFamily'
import { OFFERS } from './offers'
import { TOKEN_EVENTS } from './tokenomist'

const minimums = DEMO_DEBTS.reduce((s, d) => s + d.minPayment, 0)

test('demo family has all six debt types', () => {
  expect(new Set(DEMO_DEBTS.map((d) => d.type)).size).toBe(6)
})
test('demo family has a known monthly shortfall of 9,850', () => {
  const c = cashflow({
    monthlyIncome: DEMO_PROFILE.monthlyIncome, otherIncome: 0,
    essentials: DEMO_PROFILE.monthlyEssentials, taxSetAside: 1500, minimums,
  })
  expect(minimums).toBe(32350)
  expect(c.shortfall).toBe(9850)
})
test('plan for the demo family covers highest rate debts first', () => {
  const debts = DEMO_DEBTS.map((d, i) => ({ ...d, id: String(i), sourceId: null }))
  const p = buildPlan(debts, 22500)
  expect(p.shortfall).toBe(9850)
  const personal = p.allocations.find((a) => debts[Number(a.debtId)].type === 'personal')!
  expect(personal.reason).toBe('minimum')
})
test('every sample record is labelled with a source label and date', () => {
  for (const o of OFFERS) { expect(o.sourceLabel).toBeTruthy(); expect(o.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/) }
  for (const t of TOKEN_EVENTS) { expect(t.sourceLabel).toBeTruthy(); expect(t.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/) }
})
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npx vitest run src/data`
Expected: FAIL (modules not found).

- [ ] **Step 3: Write `src/data/sample/taxRules.ts`**

```ts
export interface SampleLabel {
  sourceLabel: string
  sourceUrl: string
  asOf: string
}

export const TAX_SAMPLE_LABEL: SampleLabel = {
  sourceLabel: 'sample',
  sourceUrl: 'https://efiling.rd.go.th/rd-cms/',
  asOf: '2026-10-15',
}
```

- [ ] **Step 4: Write `src/data/sample/tokenomist.ts`**

```ts
import type { SampleLabel } from './taxRules'

export interface TokenEvent extends SampleLabel {
  id: string
  token: string
  kind: 'unlock' | 'vesting' | 'emission'
  date: string
  amountTokens: number
  shareOfSupplyPct: number
}

// Fictional tokens and numbers. Replace with Tokenomist data once API access and terms are confirmed.
const base: SampleLabel = { sourceLabel: 'sample', sourceUrl: 'https://enterprise.tokenomist.ai/', asOf: '2026-10-15' }

export const TOKEN_EVENTS: TokenEvent[] = [
  { id: 't1', token: 'TOKA', kind: 'unlock', date: '2026-10-20', amountTokens: 12000000, shareOfSupplyPct: 1.2, ...base },
  { id: 't2', token: 'TOKB', kind: 'vesting', date: '2026-10-28', amountTokens: 4500000, shareOfSupplyPct: 0.45, ...base },
  { id: 't3', token: 'TOKA', kind: 'emission', date: '2026-11-01', amountTokens: 2000000, shareOfSupplyPct: 0.2, ...base },
  { id: 't4', token: 'TOKC', kind: 'unlock', date: '2026-11-12', amountTokens: 30000000, shareOfSupplyPct: 3.0, ...base },
]
export const WATCHLIST = ['TOKA', 'TOKB']
```

- [ ] **Step 5: Write `src/data/sample/offers.ts`**

```ts
import type { DebtType } from '../../engine'
import type { Offer } from '../../engine'
import type { SampleLabel } from './taxRules'

export type SampleOffer = Offer & SampleLabel & { forTypes: DebtType[] }

// Placeholder offers. The lead replaces these with hand-curated figures from public bank pages,
// each with its own source URL and date, before the demo.
const base = { sourceLabel: 'sample', sourceUrl: '', asOf: '2026-10-15' }

export const OFFERS: SampleOffer[] = [
  { id: 'o1', bank: 'Sample Bank A', ratePct: 7.5, termMonths: 36, fee: 2000, penalty: 0, insuranceMonthly: 0, forTypes: ['personal', 'credit_card'], ...base },
  { id: 'o2', bank: 'Sample Bank B', ratePct: 5.2, termMonths: 48, fee: 3500, penalty: 0, insuranceMonthly: 150, forTypes: ['car'], ...base },
  { id: 'o3', bank: 'Sample Bank C', ratePct: 3.2, termMonths: 240, fee: 15000, penalty: 10000, insuranceMonthly: 400, forTypes: ['home'], ...base },
]
```

- [ ] **Step 6: Write `src/data/sample/demoFamily.ts`**

```ts
import type { Debt } from '../../engine'

export const DEMO_PROFILE = {
  displayName: 'Demo family',
  birthYear: 1988,
  householdSize: 4,
  incomeType: 'salary' as const,
  monthlyIncome: 52000,
  otherIncome: 0,
  payDay: 25,
  retireAge: 60,
  postRetireIncome: null as number | null,
  monthlyEssentials: 28000,
}

export const DEMO_DEBTS: Omit<Debt, 'id' | 'sourceId'>[] = [
  { lender: 'Sample Bank A', type: 'credit_card', label: 'Credit card', balance: 85000, ratePct: 16, minPayment: 2550, dueDay: 5, termMonthsLeft: null, status: 'user_stated' },
  { lender: 'Sample Bank B', type: 'personal', label: 'Personal loan', balance: 120000, ratePct: 25, minPayment: 5200, dueDay: 10, termMonthsLeft: 30, status: 'user_stated' },
  { lender: 'Sample Bank C', type: 'car', label: 'Car loan', balance: 380000, ratePct: 6.5, minPayment: 9800, dueDay: 15, termMonthsLeft: 48, status: 'user_stated' },
  { lender: 'Sample Bank D', type: 'home', label: 'Home loan', balance: 1950000, ratePct: 3.9, minPayment: 11800, dueDay: 1, termMonthsLeft: 240, status: 'user_stated' },
  { lender: 'Student Loan Fund', type: 'student', label: 'Student loan', balance: 60000, ratePct: 1, minPayment: 1000, dueDay: 20, termMonthsLeft: 60, status: 'user_stated' },
  { lender: 'Relative', type: 'informal', label: 'Family loan', balance: 30000, ratePct: null, minPayment: 2000, dueDay: null, termMonthsLeft: null, status: 'user_stated' },
]
```

- [ ] **Step 7: Run all tests, expect PASS, then commit**

Run: `npm test` then `npm run typecheck`
Expected: PASS. Check the minimums sum by hand: 2550 + 5200 + 9800 + 11800 + 1000 + 2000 = 32350. Available = 52000 - 28000 - 1500 = 22500. Shortfall 9850.

```bash
git add src/data
git commit -m "feat(data): sample token events, offers and demo family"
```

---

### Task 6: Supabase schema and migration

**Files:**
- Create: `supabase/migrations/0001_init.sql`

**Interfaces:**
- Produces: tables `profiles`, `sources`, `debts`, `plans`, `messages` in the Supabase project `lnvpolwznueiklfgycei`, each with Row Level Security allowing a user to read and write only their own rows.

The project is named `Grid` and its `public` schema is empty. Create only the tables below. Do not touch any other schema or project.

- [ ] **Step 1: Write `supabase/migrations/0001_init.sql`**

```sql
create table public.profiles (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  display_name text,
  birth_year int,
  household_size int,
  income_type text check (income_type in ('salary','freelance','both')),
  monthly_income numeric,
  other_income numeric default 0,
  pay_day int,
  retire_age int,
  post_retire_income numeric,
  monthly_essentials numeric,
  lang text default 'th' check (lang in ('th','en')),
  onboarded_at timestamptz,
  created_at timestamptz default now()
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('upload','voice','form','sample')),
  file_name text,
  page int,
  line_text text,
  confidence numeric,
  created_at timestamptz default now()
);

create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  lender text not null,
  type text not null check (type in ('credit_card','personal','car','home','student','informal')),
  label text not null,
  balance numeric not null check (balance >= 0),
  rate_pct numeric,
  min_payment numeric not null default 0 check (min_payment >= 0),
  due_day int check (due_day between 1 and 31),
  term_months_left int,
  status text not null default 'user_stated' check (status in ('verified','needs_review','user_stated')),
  source_id uuid references public.sources(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  month text not null,
  inputs jsonb not null,
  result jsonb not null,
  created_at timestamptz default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  masked_payload jsonb,
  created_at timestamptz default now()
);

create index on public.sources (user_id);
create index on public.debts (user_id);
create index on public.debts (user_id, lender);
create index on public.debts (user_id, type);
create index on public.plans (user_id);
create index on public.messages (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.sources enable row level security;
alter table public.debts enable row level security;
alter table public.plans enable row level security;
alter table public.messages enable row level security;

create policy "own rows" on public.profiles for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.sources  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.debts    for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.plans    for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own rows" on public.messages for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
```

- [ ] **Step 2: Apply the migration**

Use the Supabase MCP tool `apply_migration` with `project_id: lnvpolwznueiklfgycei`, `name: init`, and the SQL from Step 1. If that tool is unavailable, tell the user to paste the SQL into the Supabase SQL editor for this project, then wait for confirmation.

- [ ] **Step 3: Verify tables and RLS**

Use `list_tables` with `schemas: ["public"]`, `verbose: true`.
Expected: the five tables exist and each shows RLS enabled. Then run the `get_advisors` tool for `security`. Expected: no `rls_disabled` findings for these tables. Fix any finding by editing the migration and re-applying.

- [ ] **Step 4: Enable auth providers (manual, tell the user)**

Print this note to the user and wait: "In Supabase dashboard, Authentication > Providers: enable Email, and enable Google with a Google OAuth client ID and secret. Add `http://localhost:5173` and the Vercel URL to Authentication > URL Configuration > Redirect URLs."

- [ ] **Step 5: Commit**

```bash
git add supabase
git commit -m "feat(db): initial schema with row level security"
```

---

Part 1 ends here. Continue with `2026-10-15-debtwise-part2-app.md` starting at Task 7.
