# Debtwise Implementation Plan, Part 2A: Store, i18n, Shell, Auth, Onboarding, Debt screens

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax. Do Part 1 first. Part 2B (`2026-10-15-debtwise-part2b-ai-and-finish.md`) continues from Task 12.

**Goal:** Build the data store, translations, app shell, sign in, onboarding, profile and the debt screens.

**Architecture and Global Constraints:** same as Part 1. Read the "Global Constraints" and "Review Focus" in `2026-10-15-debtwise-part1-foundation-engine.md` before starting. UI rules are in `DESIGN.md`.

**Spec:** `docs/superpowers/specs/2026-10-15-debtwise-design.md`

**Rule for text:** every string a user sees comes from `src/i18n` through `useT()`. No hard coded text in components. All keys are defined once in Task 8. Later tasks only use keys that exist there.

---

### Task 7: Data store and app state

**Files:**
- Create: `src/store/types.ts`, `src/lib/supabase.ts`, `src/store/supabaseStore.ts`, `src/store/supabaseStore.test.ts`, `src/store/useApp.ts`

**Interfaces:**
- Consumes: `Debt`, `Lang` from `src/engine`
- Produces:
  - `Profile`, `SourceInput`, `Source`, `DebtInput`, `Message`, `DataStore` (in `src/store/types.ts`)
  - `debtFromRow(r)`, `debtToRow(d)`, `profileFromRow(r)`, `profileToRow(p)`, `class SupabaseStore implements DataStore` (constructor `(client, userId)`)
  - `useApp()` zustand hook with state `{ ready, userId, profile, debts, store, lang }` and actions `init()`, `refresh()`, `setLang(l)`, `signOut()`

- [ ] **Step 1: Write `src/store/types.ts`**

```ts
import type { Debt, Lang } from '../engine'

export interface Profile {
  displayName: string
  birthYear: number | null
  householdSize: number | null
  incomeType: 'salary' | 'freelance' | 'both' | null
  monthlyIncome: number | null
  otherIncome: number
  payDay: number | null
  retireAge: number | null
  postRetireIncome: number | null
  monthlyEssentials: number | null
  lang: Lang
  onboardedAt: string | null
}
export interface SourceInput {
  kind: 'upload' | 'voice' | 'form' | 'sample'
  fileName?: string
  page?: number
  lineText?: string
  confidence?: number
}
export interface Source extends SourceInput {
  id: string
}
export type DebtInput = Omit<Debt, 'id'>
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  maskedPayload?: unknown
  createdAt: string
}

export interface DataStore {
  getProfile(): Promise<Profile | null>
  saveProfile(p: Partial<Profile>): Promise<Profile>
  listDebts(): Promise<Debt[]>
  saveDebt(d: DebtInput & { id?: string }): Promise<Debt>
  deleteDebt(id: string): Promise<void>
  saveSource(s: SourceInput): Promise<Source>
  getSources(ids: string[]): Promise<Source[]>
  listMessages(limit?: number): Promise<Message[]>
  addMessage(m: Omit<Message, 'id' | 'createdAt'>): Promise<Message>
  savePlan(month: string, inputs: unknown, result: unknown): Promise<void>
  hasPlan(month: string): Promise<boolean>
  deleteSampleData(): Promise<void>
  exportAll(): Promise<unknown>
  deleteAll(): Promise<void>
}
```

- [ ] **Step 2: Write `src/lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
})
```

- [ ] **Step 3: Write the failing mapping test `src/store/supabaseStore.test.ts`**

```ts
import { expect, test } from 'vitest'
import { debtFromRow, debtToRow, profileFromRow, profileToRow } from './supabaseStore'

test('debt row maps to the Debt shape and numeric strings become numbers', () => {
  const d = debtFromRow({
    id: 'a', lender: 'Bank', type: 'car', label: 'Car', balance: '1000', rate_pct: null,
    min_payment: '200', due_day: 5, term_months_left: 12, status: 'verified', source_id: 's1',
  })
  expect(d).toEqual({
    id: 'a', lender: 'Bank', type: 'car', label: 'Car', balance: 1000, ratePct: null,
    minPayment: 200, dueDay: 5, termMonthsLeft: 12, status: 'verified', sourceId: 's1',
  })
})
test('debtToRow only includes keys that are present', () => {
  expect(debtToRow({ balance: 5, ratePct: null })).toEqual({ balance: 5, rate_pct: null })
})
test('profile round trip keeps values and defaults', () => {
  const row = profileToRow({ displayName: 'A', monthlyIncome: 100, lang: 'en' })
  expect(row).toEqual({ display_name: 'A', monthly_income: 100, lang: 'en' })
  const p = profileFromRow({ display_name: 'A', monthly_income: '100', other_income: null, lang: 'en', onboarded_at: null })
  expect(p.monthlyIncome).toBe(100)
  expect(p.otherIncome).toBe(0)
  expect(p.lang).toBe('en')
})
```

- [ ] **Step 4: Run to verify FAIL**

Run: `npx vitest run src/store`
Expected: FAIL (module not found).

- [ ] **Step 5: Write `src/store/supabaseStore.ts`**

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Debt } from '../engine'
import type { DataStore, DebtInput, Message, Profile, Source, SourceInput } from './types'

const num = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number(v))

export function debtFromRow(r: any): Debt {
  return {
    id: r.id, lender: r.lender, type: r.type, label: r.label,
    balance: Number(r.balance), ratePct: num(r.rate_pct), minPayment: Number(r.min_payment),
    dueDay: r.due_day ?? null, termMonthsLeft: r.term_months_left ?? null,
    status: r.status, sourceId: r.source_id ?? null,
  }
}

export function debtToRow(d: Partial<DebtInput>): Record<string, unknown> {
  const map: Record<string, string> = {
    lender: 'lender', type: 'type', label: 'label', balance: 'balance', ratePct: 'rate_pct',
    minPayment: 'min_payment', dueDay: 'due_day', termMonthsLeft: 'term_months_left',
    status: 'status', sourceId: 'source_id',
  }
  const out: Record<string, unknown> = {}
  for (const [k, col] of Object.entries(map)) if (k in d) out[col] = (d as any)[k]
  return out
}

const PROFILE_MAP: Record<string, string> = {
  displayName: 'display_name', birthYear: 'birth_year', householdSize: 'household_size',
  incomeType: 'income_type', monthlyIncome: 'monthly_income', otherIncome: 'other_income',
  payDay: 'pay_day', retireAge: 'retire_age', postRetireIncome: 'post_retire_income',
  monthlyEssentials: 'monthly_essentials', lang: 'lang', onboardedAt: 'onboarded_at',
}

export function profileToRow(p: Partial<Profile>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, col] of Object.entries(PROFILE_MAP)) if (k in p) out[col] = (p as any)[k]
  return out
}

export function profileFromRow(r: any): Profile {
  return {
    displayName: r.display_name ?? '', birthYear: r.birth_year ?? null, householdSize: r.household_size ?? null,
    incomeType: r.income_type ?? null, monthlyIncome: num(r.monthly_income), otherIncome: num(r.other_income) ?? 0,
    payDay: r.pay_day ?? null, retireAge: r.retire_age ?? null, postRetireIncome: num(r.post_retire_income),
    monthlyEssentials: num(r.monthly_essentials), lang: r.lang === 'en' ? 'en' : 'th', onboardedAt: r.onboarded_at ?? null,
  }
}

function fail(e: { message: string } | null): never | void {
  if (e) throw new Error(e.message)
}

export class SupabaseStore implements DataStore {
  constructor(private db: SupabaseClient, private userId: string) {}

  async getProfile() {
    const { data, error } = await this.db.from('profiles').select('*').eq('user_id', this.userId).maybeSingle()
    fail(error)
    return data ? profileFromRow(data) : null
  }
  async saveProfile(p: Partial<Profile>) {
    const { data, error } = await this.db
      .from('profiles').upsert({ user_id: this.userId, ...profileToRow(p) }, { onConflict: 'user_id' }).select('*').single()
    fail(error)
    return profileFromRow(data)
  }
  async listDebts() {
    const { data, error } = await this.db.from('debts').select('*').eq('user_id', this.userId).order('created_at')
    fail(error)
    return (data ?? []).map(debtFromRow)
  }
  async saveDebt(d: DebtInput & { id?: string }) {
    const row = { ...debtToRow(d), user_id: this.userId, updated_at: new Date().toISOString() }
    const q = d.id
      ? this.db.from('debts').update(row).eq('id', d.id).eq('user_id', this.userId)
      : this.db.from('debts').insert(row)
    const { data, error } = await q.select('*').single()
    fail(error)
    return debtFromRow(data)
  }
  async deleteDebt(id: string) {
    const { error } = await this.db.from('debts').delete().eq('id', id).eq('user_id', this.userId)
    fail(error)
  }
  async saveSource(s: SourceInput): Promise<Source> {
    const { data, error } = await this.db.from('sources').insert({
      user_id: this.userId, kind: s.kind, file_name: s.fileName ?? null, page: s.page ?? null,
      line_text: s.lineText ?? null, confidence: s.confidence ?? null,
    }).select('*').single()
    fail(error)
    return { id: data.id, kind: data.kind, fileName: data.file_name ?? undefined, page: data.page ?? undefined, lineText: data.line_text ?? undefined, confidence: data.confidence ?? undefined }
  }
  async getSources(ids: string[]) {
    if (!ids.length) return []
    const { data, error } = await this.db.from('sources').select('*').in('id', ids)
    fail(error)
    return (data ?? []).map((r: any) => ({ id: r.id, kind: r.kind, fileName: r.file_name ?? undefined, page: r.page ?? undefined, lineText: r.line_text ?? undefined, confidence: r.confidence ?? undefined }))
  }
  async listMessages(limit = 50) {
    const { data, error } = await this.db.from('messages').select('*').eq('user_id', this.userId).order('created_at', { ascending: false }).limit(limit)
    fail(error)
    return (data ?? []).reverse().map((r: any): Message => ({ id: r.id, role: r.role, content: r.content, maskedPayload: r.masked_payload ?? undefined, createdAt: r.created_at }))
  }
  async addMessage(m: Omit<Message, 'id' | 'createdAt'>) {
    const { data, error } = await this.db.from('messages').insert({
      user_id: this.userId, role: m.role, content: m.content, masked_payload: m.maskedPayload ?? null,
    }).select('*').single()
    fail(error)
    return { id: data.id, role: data.role, content: data.content, maskedPayload: data.masked_payload ?? undefined, createdAt: data.created_at } as Message
  }
  async savePlan(month: string, inputs: unknown, result: unknown) {
    const { error } = await this.db.from('plans').insert({ user_id: this.userId, month, inputs, result })
    fail(error)
  }
  async hasPlan(month: string) {
    const { data, error } = await this.db.from('plans').select('id').eq('user_id', this.userId).eq('month', month).limit(1)
    fail(error)
    return (data ?? []).length > 0
  }
  async deleteSampleData() {
    const { data, error } = await this.db.from('sources').select('id').eq('user_id', this.userId).eq('kind', 'sample')
    fail(error)
    const ids = (data ?? []).map((r: any) => r.id)
    if (!ids.length) return
    const d = await this.db.from('debts').delete().eq('user_id', this.userId).in('source_id', ids)
    fail(d.error)
    const s = await this.db.from('sources').delete().eq('user_id', this.userId).in('id', ids)
    fail(s.error)
  }
  async exportAll() {
    const out: Record<string, unknown> = {}
    for (const t of ['profiles', 'sources', 'debts', 'plans', 'messages']) {
      const { data, error } = await this.db.from(t).select('*').eq('user_id', this.userId)
      fail(error)
      out[t] = data
    }
    return out
  }
  async deleteAll() {
    for (const t of ['messages', 'plans', 'debts', 'sources', 'profiles']) {
      const { error } = await this.db.from(t).delete().eq('user_id', this.userId)
      fail(error)
    }
  }
}
```

- [ ] **Step 6: Write `src/store/useApp.ts`**

```ts
import { create } from 'zustand'
import type { Debt, Lang } from '../engine'
import { supabase } from '../lib/supabase'
import { SupabaseStore } from './supabaseStore'
import type { DataStore, Profile } from './types'

interface AppState {
  ready: boolean
  userId: string | null
  profile: Profile | null
  debts: Debt[]
  store: DataStore | null
  lang: Lang
  init: () => Promise<void>
  refresh: () => Promise<void>
  setLang: (l: Lang) => void
  signOut: () => Promise<void>
}

const readLang = (): Lang => {
  try { return localStorage.getItem('dw-lang') === 'en' ? 'en' : 'th' } catch { return 'th' }
}

export const useApp = create<AppState>((set, get) => ({
  ready: false, userId: null, profile: null, debts: [], store: null, lang: readLang(),

  async init() {
    const apply = async (userId: string | null) => {
      if (!userId) { set({ userId: null, store: null, profile: null, debts: [], ready: true }); return }
      const store = new SupabaseStore(supabase, userId)
      set({ userId, store })
      await get().refresh()
      set({ ready: true })
    }
    const { data } = await supabase.auth.getSession()
    await apply(data.session?.user.id ?? null)
    supabase.auth.onAuthStateChange((_e, session) => { void apply(session?.user.id ?? null) })
  },

  async refresh() {
    const { store } = get()
    if (!store) return
    const [profile, debts] = await Promise.all([store.getProfile(), store.listDebts()])
    set({ profile, debts, lang: profile?.lang ?? get().lang })
  },

  setLang(lang) {
    try { localStorage.setItem('dw-lang', lang) } catch { /* storage may be blocked */ }
    document.documentElement.lang = lang
    set({ lang })
    const { store, profile } = get()
    if (store && profile) void store.saveProfile({ lang })
  },

  async signOut() {
    await supabase.auth.signOut()
    set({ userId: null, store: null, profile: null, debts: [] })
  },
}))
```

- [ ] **Step 7: Run tests and typecheck, expect PASS**

Run: `npm test` then `npm run typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "feat(store): DataStore interface, Supabase store and app state"
```

---

### Task 8: Translations

**Files:**
- Create: `src/i18n/en.ts`, `src/i18n/th.ts`, `src/i18n/tr.ts`, `src/i18n/index.ts`, `src/i18n/i18n.test.ts`

**Interfaces:**
- Produces: `useT(): (key: Key, vars?: Record<string, string | number>) => string`, `tr(lang, key, vars?)`, `type Key`.

- [ ] **Step 1: Write the failing test `src/i18n/i18n.test.ts`**

```ts
import { expect, test } from 'vitest'
import { en } from './en'
import { th } from './th'
import { tr } from './tr'

test('Thai and English have exactly the same keys', () => {
  expect(Object.keys(th).sort()).toEqual(Object.keys(en).sort())
})
test('no value is empty', () => {
  for (const [k, v] of [...Object.entries(en), ...Object.entries(th)]) expect(v.trim().length, k).toBeGreaterThan(0)
})
test('no em dash in any text', () => {
  for (const v of [...Object.values(en), ...Object.values(th)]) expect(v.includes('—')).toBe(false)
})
test('placeholders match between languages', () => {
  const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',')
  for (const k of Object.keys(en) as (keyof typeof en)[]) expect(ph(th[k]), k).toBe(ph(en[k]))
})
test('tr fills placeholders and falls back to English', () => {
  expect(tr('en', 'home.greeting', { name: 'Ann' })).toBe('Hello, Ann')
  expect(tr('th', 'home.greeting', { name: 'แอน' })).toBe('สวัสดี แอน')
})
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npx vitest run src/i18n`
Expected: FAIL.

- [ ] **Step 3: Write `src/i18n/en.ts`**

```ts
export const en = {
  'app.name': 'Debtwise',
  'nav.home': 'Home', 'nav.invest': 'Invest', 'nav.tax': 'Tax', 'nav.debt': 'Debt',
  'common.save': 'Save', 'common.cancel': 'Cancel', 'common.back': 'Back', 'common.next': 'Next',
  'common.later': 'Later', 'common.sample': 'sample', 'common.estimate': 'estimate', 'common.demo': 'demo',
  'common.delete': 'Delete', 'common.confirm': 'Confirm', 'common.loading': 'Loading',
  'common.error': 'Something went wrong. Try again.', 'common.perMonth': 'per month',
  'common.total': 'Total', 'common.owed': 'Owed',
  'status.verified': 'Verified', 'status.needs_review': 'Needs review', 'status.user_stated': 'User stated', 'status.sample': 'Sample',
  'type.credit_card': 'Credit card', 'type.personal': 'Personal and nano loan', 'type.car': 'Car or motorbike',
  'type.home': 'Home', 'type.student': 'Student loan', 'type.informal': 'Informal',
  'signin.title': 'Sign in', 'signin.line': 'See all your debts and understand what you can pay.',
  'signin.google': 'Continue with Google', 'signin.email': 'Email', 'signin.emailSend': 'Send sign in link',
  'signin.emailSent': 'Check your email for the link.',
  'onb.step': 'Step {n} of {total}', 'onb.aboutTitle': 'About you', 'onb.incomeTitle': 'Income',
  'onb.retireTitle': 'Work horizon', 'onb.essentialsTitle': 'Essentials', 'onb.debtsTitle': 'Your debts',
  'onb.debtsLine': 'Add them now or later.', 'onb.finish': 'Finish', 'onb.addNow': 'Add debts now',
  'field.displayName': 'Name', 'field.birthYear': 'Birth year (CE)', 'field.household': 'People who depend on your income',
  'field.incomeType': 'Income type', 'field.income.salary': 'Salary', 'field.income.freelance': 'Freelance', 'field.income.both': 'Both',
  'field.monthlyIncome': 'Monthly income', 'field.otherIncome': 'Other monthly income', 'field.payDay': 'Pay day',
  'field.retireAge': 'Age you plan to stop working', 'field.postRetire': 'Expected income after that (optional)',
  'field.essentials': 'Monthly essentials (rent, food, school fees)',
  'field.required': 'Required', 'field.invalid': 'Check this value',
  'debt.lender': 'Lender', 'debt.type': 'Type', 'debt.label': 'Name', 'debt.balance': 'Balance',
  'debt.rate': 'Interest rate per year (%)', 'debt.minPayment': 'Minimum payment', 'debt.dueDay': 'Due day of month',
  'debt.termLeft': 'Months left', 'debt.add': 'Add a debt', 'debt.byBank': 'By bank', 'debt.byType': 'By type',
  'debt.empty': 'No debts yet. Add one to start.', 'debt.totalOwed': 'Total owed', 'debt.monthlyTotal': 'Monthly payments',
  'debt.source': 'Source', 'debt.sourceYou': 'You said', 'debt.sourceSample': 'Sample data', 'debt.sourceNone': 'No source',
  'debt.share': 'of total',
  'add.title': 'Add a debt', 'add.upload': 'Upload a statement', 'add.uploadHint': 'Photo or PDF. You check every number.',
  'add.talk': 'Talk it through', 'add.form': 'Enter by hand',
  'review.title': 'Check the numbers', 'review.line': 'Each value comes from a line in your document. Confirm the ones that match.',
  'review.matches': 'This matches my document', 'review.saveChecked': 'Save confirmed debts', 'review.sourceLine': 'Source line',
  'review.confidence': 'Confidence', 'review.none': 'Nothing was found in this file. Try another or enter by hand.',
  'plan.title': 'This month', 'plan.available': 'Available after essentials and tax', 'plan.minimums': 'Minimum payments',
  'plan.shortfall': 'Short by', 'plan.leftover': 'Left over',
  'plan.noEssentials': 'Add your monthly essentials in Profile so the plan can protect them.',
  'plan.reason.minimum': 'Minimum payment', 'plan.reason.partial_minimum': 'Part of the minimum, money ran out',
  'plan.reason.extra': 'Extra, highest interest first', 'plan.reason.unpaid': 'Not covered this month',
  'plan.save': 'Save this plan', 'plan.saved': 'Plan saved', 'plan.options': 'Talk to your lender before a payment is missed.',
  'refi.title': 'Refinance check', 'refi.line': 'Compares a sample offer with your loan after fees and penalty.',
  'refi.current': 'Current', 'refi.new': 'Offer', 'refi.payment': 'Monthly payment', 'refi.total': 'Total cost',
  'refi.saving': 'Net saving', 'refi.loss': 'Net cost', 'refi.worth': 'On these numbers, switching costs less.',
  'refi.notWorth': 'On these numbers, switching does not cost less.', 'refi.longer': 'The term is longer than what you have left.',
  'refi.inputs': 'Inputs', 'refi.fee': 'Fee', 'refi.penalty': 'Penalty', 'refi.insurance': 'Insurance per month',
  'refi.none': 'No sample offer for this loan type.',
  'home.greeting': 'Hello, {name}', 'home.thisMonth': 'This month', 'home.income': 'Income', 'home.essentials': 'Essentials',
  'home.debts': 'Debt payments', 'home.tax': 'Tax set aside', 'home.left': 'Left', 'home.nextDue': 'Next due',
  'home.dueIn': 'in {n} days', 'home.talk': 'Talk to Debtwise', 'home.openPlan': 'See the plan',
  'invest.title': 'Token events', 'invest.watchlist': 'Watchlist', 'invest.upcoming': 'Upcoming', 'invest.share': 'of supply',
  'invest.context': 'After essentials, debt and tax you have {amount} left this month. Information only.',
  'invest.disclaimer': 'Information only, not advice.', 'invest.kind.unlock': 'Unlock', 'invest.kind.vesting': 'Vesting', 'invest.kind.emission': 'Emission',
  'tax.title': 'Tax estimate', 'tax.year': 'Tax year', 'tax.annualIncome': 'Annual income', 'tax.due': 'Estimated tax',
  'tax.assumptions': 'Assumptions', 'tax.reduce': 'Ways to reduce it',
  'tax.reduceLine': 'You may be able to claim these. Check the rule and keep the paperwork.',
  'tax.maySave': 'May save up to', 'tax.paperwork': 'Keep', 'tax.missing': 'Add your income in Profile to see an estimate.',
  'tax.disclaimer': 'Estimate from sample rules, not tax advice.',
  'talk.title': 'Talk to Debtwise', 'talk.placeholder': 'Tell me what changed', 'talk.send': 'Send', 'talk.mic': 'Speak', 'talk.ai': 'AI',
  'talk.flagged': 'Some figures in this reply could not be checked against your numbers.',
  'talk.proposal': 'Proposed change', 'talk.apply': 'Apply',
  'talk.intro': 'I can look at your numbers and talk through a hard month. I never move money.',
  'profile.title': 'Profile', 'profile.language': 'Language', 'profile.data': 'Your data',
  'profile.dataLine': 'Stored in your Debtwise account.', 'profile.export': 'Export a copy',
  'profile.deleteAll': 'Delete all my data', 'profile.deleteConfirm': 'This removes your debts, plans and messages. Type delete to confirm.',
  'profile.loadDemo': 'Load demo family', 'profile.removeDemo': 'Remove demo data', 'profile.signOut': 'Sign out', 'profile.saved': 'Saved',
} as const

export type Key = keyof typeof en
```

- [ ] **Step 4: Write `src/i18n/th.ts`**

```ts
import type { Key } from './en'

export const th: Record<Key, string> = {
  'app.name': 'Debtwise',
  'nav.home': 'หน้าหลัก', 'nav.invest': 'ลงทุน', 'nav.tax': 'ภาษี', 'nav.debt': 'หนี้',
  'common.save': 'บันทึก', 'common.cancel': 'ยกเลิก', 'common.back': 'ย้อนกลับ', 'common.next': 'ถัดไป',
  'common.later': 'ไว้ทีหลัง', 'common.sample': 'ตัวอย่าง', 'common.estimate': 'ประมาณการ', 'common.demo': 'สาธิต',
  'common.delete': 'ลบ', 'common.confirm': 'ยืนยัน', 'common.loading': 'กำลังโหลด',
  'common.error': 'เกิดข้อผิดพลาด ลองอีกครั้ง', 'common.perMonth': 'ต่อเดือน',
  'common.total': 'รวม', 'common.owed': 'ยอดค้าง',
  'status.verified': 'ยืนยันแล้ว', 'status.needs_review': 'ต้องตรวจสอบ', 'status.user_stated': 'ผู้ใช้ระบุ', 'status.sample': 'ตัวอย่าง',
  'type.credit_card': 'บัตรเครดิต', 'type.personal': 'สินเชื่อส่วนบุคคลและนาโนไฟแนนซ์', 'type.car': 'รถยนต์หรือมอเตอร์ไซค์',
  'type.home': 'บ้าน', 'type.student': 'กยศ.', 'type.informal': 'หนี้นอกระบบหรือยืมคนรู้จัก',
  'signin.title': 'เข้าสู่ระบบ', 'signin.line': 'เห็นหนี้ทั้งหมดและรู้ว่าจ่ายไหวเท่าไร',
  'signin.google': 'ดำเนินการต่อด้วย Google', 'signin.email': 'อีเมล', 'signin.emailSend': 'ส่งลิงก์เข้าสู่ระบบ',
  'signin.emailSent': 'ตรวจสอบอีเมลเพื่อรับลิงก์',
  'onb.step': 'ขั้นที่ {n} จาก {total}', 'onb.aboutTitle': 'เกี่ยวกับคุณ', 'onb.incomeTitle': 'รายได้',
  'onb.retireTitle': 'ช่วงเวลาทำงาน', 'onb.essentialsTitle': 'ค่าใช้จ่ายจำเป็น', 'onb.debtsTitle': 'หนี้ของคุณ',
  'onb.debtsLine': 'เพิ่มตอนนี้หรือไว้ทีหลังก็ได้', 'onb.finish': 'เสร็จสิ้น', 'onb.addNow': 'เพิ่มหนี้ตอนนี้',
  'field.displayName': 'ชื่อ', 'field.birthYear': 'ปีเกิด (ค.ศ.)', 'field.household': 'จำนวนคนที่พึ่งพารายได้ของคุณ',
  'field.incomeType': 'ประเภทรายได้', 'field.income.salary': 'เงินเดือน', 'field.income.freelance': 'ฟรีแลนซ์', 'field.income.both': 'ทั้งสองอย่าง',
  'field.monthlyIncome': 'รายได้ต่อเดือน', 'field.otherIncome': 'รายได้อื่นต่อเดือน', 'field.payDay': 'วันที่เงินเดือนเข้า',
  'field.retireAge': 'อายุที่วางแผนเลิกทำงาน', 'field.postRetire': 'รายได้ที่คาดหวังหลังจากนั้น (ไม่บังคับ)',
  'field.essentials': 'ค่าใช้จ่ายจำเป็นต่อเดือน (ค่าเช่า อาหาร ค่าเทอม)',
  'field.required': 'จำเป็น', 'field.invalid': 'ตรวจสอบค่านี้',
  'debt.lender': 'ผู้ให้กู้', 'debt.type': 'ประเภท', 'debt.label': 'ชื่อรายการ', 'debt.balance': 'ยอดคงเหลือ',
  'debt.rate': 'อัตราดอกเบี้ยต่อปี (%)', 'debt.minPayment': 'ยอดชำระขั้นต่ำ', 'debt.dueDay': 'วันครบกำหนดของเดือน',
  'debt.termLeft': 'จำนวนเดือนที่เหลือ', 'debt.add': 'เพิ่มหนี้', 'debt.byBank': 'ตามผู้ให้กู้', 'debt.byType': 'ตามประเภท',
  'debt.empty': 'ยังไม่มีหนี้ เพิ่มรายการเพื่อเริ่มต้น', 'debt.totalOwed': 'ยอดค้างรวม', 'debt.monthlyTotal': 'ยอดชำระต่อเดือน',
  'debt.source': 'แหล่งที่มา', 'debt.sourceYou': 'คุณระบุ', 'debt.sourceSample': 'ข้อมูลตัวอย่าง', 'debt.sourceNone': 'ไม่มีแหล่งที่มา',
  'debt.share': 'ของยอดรวม',
  'add.title': 'เพิ่มหนี้', 'add.upload': 'อัปโหลดใบแจ้งหนี้', 'add.uploadHint': 'รูปภาพหรือ PDF คุณตรวจสอบทุกตัวเลข',
  'add.talk': 'พูดคุยเพื่อเพิ่ม', 'add.form': 'กรอกเอง',
  'review.title': 'ตรวจสอบตัวเลข', 'review.line': 'ทุกค่ามาจากบรรทัดในเอกสารของคุณ ยืนยันรายการที่ตรงกัน',
  'review.matches': 'ตรงกับเอกสารของฉัน', 'review.saveChecked': 'บันทึกหนี้ที่ยืนยันแล้ว', 'review.sourceLine': 'บรรทัดต้นฉบับ',
  'review.confidence': 'ความมั่นใจ', 'review.none': 'ไม่พบข้อมูลในไฟล์นี้ ลองไฟล์อื่นหรือกรอกเอง',
  'plan.title': 'เดือนนี้', 'plan.available': 'เงินที่ใช้ได้หลังหักค่าจำเป็นและภาษี', 'plan.minimums': 'ยอดชำระขั้นต่ำรวม',
  'plan.shortfall': 'ขาดอยู่', 'plan.leftover': 'เหลือ',
  'plan.noEssentials': 'เพิ่มค่าใช้จ่ายจำเป็นต่อเดือนในโปรไฟล์ เพื่อให้แผนกันเงินส่วนนี้ไว้',
  'plan.reason.minimum': 'ชำระขั้นต่ำ', 'plan.reason.partial_minimum': 'ชำระขั้นต่ำได้บางส่วน เงินไม่พอ',
  'plan.reason.extra': 'จ่ายเพิ่ม โดยเริ่มจากดอกเบี้ยสูงสุด', 'plan.reason.unpaid': 'เดือนนี้ยังจ่ายไม่ได้',
  'plan.save': 'บันทึกแผนนี้', 'plan.saved': 'บันทึกแผนแล้ว', 'plan.options': 'คุยกับผู้ให้กู้ก่อนที่จะพลาดการชำระ',
  'refi.title': 'ตรวจสอบการรีไฟแนนซ์', 'refi.line': 'เปรียบเทียบข้อเสนอตัวอย่างกับสินเชื่อของคุณหลังรวมค่าธรรมเนียมและค่าปรับ',
  'refi.current': 'ปัจจุบัน', 'refi.new': 'ข้อเสนอ', 'refi.payment': 'ชำระต่อเดือน', 'refi.total': 'ต้นทุนรวม',
  'refi.saving': 'ประหยัดสุทธิ', 'refi.loss': 'ต้นทุนเพิ่มสุทธิ', 'refi.worth': 'จากตัวเลขเหล่านี้ การเปลี่ยนมีต้นทุนต่ำกว่า',
  'refi.notWorth': 'จากตัวเลขเหล่านี้ การเปลี่ยนไม่ได้มีต้นทุนต่ำกว่า', 'refi.longer': 'ระยะเวลาผ่อนยาวกว่าที่เหลืออยู่',
  'refi.inputs': 'ข้อมูลที่ใช้', 'refi.fee': 'ค่าธรรมเนียม', 'refi.penalty': 'ค่าปรับ', 'refi.insurance': 'ประกันต่อเดือน',
  'refi.none': 'ไม่มีข้อเสนอตัวอย่างสำหรับสินเชื่อประเภทนี้',
  'home.greeting': 'สวัสดี {name}', 'home.thisMonth': 'เดือนนี้', 'home.income': 'รายได้', 'home.essentials': 'ค่าจำเป็น',
  'home.debts': 'ชำระหนี้', 'home.tax': 'กันไว้สำหรับภาษี', 'home.left': 'คงเหลือ', 'home.nextDue': 'ครบกำหนดถัดไป',
  'home.dueIn': 'ในอีก {n} วัน', 'home.talk': 'คุยกับ Debtwise', 'home.openPlan': 'ดูแผน',
  'invest.title': 'เหตุการณ์ของโทเคน', 'invest.watchlist': 'รายการที่ติดตาม', 'invest.upcoming': 'ที่กำลังจะมาถึง', 'invest.share': 'ของอุปทาน',
  'invest.context': 'หลังหักค่าจำเป็น หนี้ และภาษี คุณเหลือ {amount} ในเดือนนี้ เป็นข้อมูลเท่านั้น',
  'invest.disclaimer': 'ข้อมูลเท่านั้น ไม่ใช่คำแนะนำ', 'invest.kind.unlock': 'ปลดล็อก', 'invest.kind.vesting': 'การทยอยปล่อย', 'invest.kind.emission': 'การออกเหรียญ',
  'tax.title': 'ประมาณการภาษี', 'tax.year': 'ปีภาษี', 'tax.annualIncome': 'รายได้ต่อปี', 'tax.due': 'ภาษีโดยประมาณ',
  'tax.assumptions': 'สมมติฐาน', 'tax.reduce': 'แนวทางลดภาษี',
  'tax.reduceLine': 'คุณอาจใช้สิทธิ์เหล่านี้ได้ ตรวจสอบเงื่อนไขและเก็บเอกสารไว้',
  'tax.maySave': 'อาจประหยัดได้สูงสุด', 'tax.paperwork': 'เอกสารที่ต้องเก็บ', 'tax.missing': 'เพิ่มรายได้ในโปรไฟล์เพื่อดูประมาณการ',
  'tax.disclaimer': 'ประมาณการจากกฎตัวอย่าง ไม่ใช่คำแนะนำด้านภาษี',
  'talk.title': 'คุยกับ Debtwise', 'talk.placeholder': 'เล่าให้ฟังว่าเกิดอะไรขึ้น', 'talk.send': 'ส่ง', 'talk.mic': 'พูด', 'talk.ai': 'เอไอ',
  'talk.flagged': 'ตัวเลขบางส่วนในคำตอบนี้ตรวจสอบกับข้อมูลของคุณไม่ได้',
  'talk.proposal': 'การเปลี่ยนแปลงที่เสนอ', 'talk.apply': 'ใช้ค่านี้',
  'talk.intro': 'ฉันดูตัวเลขของคุณและช่วยคุยเรื่องเดือนที่ลำบากได้ ฉันไม่โอนเงินให้',
  'profile.title': 'โปรไฟล์', 'profile.language': 'ภาษา', 'profile.data': 'ข้อมูลของคุณ',
  'profile.dataLine': 'เก็บไว้ในบัญชี Debtwise ของคุณ', 'profile.export': 'ส่งออกสำเนา',
  'profile.deleteAll': 'ลบข้อมูลทั้งหมดของฉัน', 'profile.deleteConfirm': 'การลบนี้จะลบหนี้ แผน และข้อความของคุณ พิมพ์ delete เพื่อยืนยัน',
  'profile.loadDemo': 'โหลดครอบครัวตัวอย่าง', 'profile.removeDemo': 'ลบข้อมูลสาธิต', 'profile.signOut': 'ออกจากระบบ', 'profile.saved': 'บันทึกแล้ว',
}
```

- [ ] **Step 5: Write `src/i18n/tr.ts` and `src/i18n/index.ts`**

`tr.ts` has no store import, so tests run without Supabase env vars:
```ts
import type { Lang } from '../engine'
import { en, type Key } from './en'
import { th } from './th'

export type { Key }
const dict: Record<Lang, Record<Key, string>> = { en, th }

export function tr(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  let s = dict[lang][key] ?? en[key]
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}
```
`index.ts`:
```ts
import { useApp } from '../store/useApp'
import { tr, type Key } from './tr'

export { tr }
export type { Key }

export function useT() {
  const lang = useApp((s) => s.lang)
  return (key: Key, vars?: Record<string, string | number>) => tr(lang, key, vars)
}
```

- [ ] **Step 6: Run tests and typecheck, expect PASS, then commit**

Run: `npm test` then `npm run typecheck`
Expected: PASS.

```bash
git add src/i18n
git commit -m "feat(i18n): Thai and English dictionaries with parity tests"
```

---

### Task 9: Styles, icons and app shell

**Files:**
- Create: `public/fonts/lineseedsansth_rg.woff2` (copy), `src/styles/tokens.css`, `src/styles/base.css`, `src/components/Icon.tsx`, `src/components/Shell.tsx`, `src/App.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Produces: `<Icon name size />`, `<Shell />` (top bar, bottom nav or rail, outlet), CSS classes listed in `base.css`, and the route table in `App.tsx`.

- [ ] **Step 1: Copy the self-hosted font**

Run (one allowed read outside the folder):
```bash
mkdir -p public/fonts
cp "../Website - Taskmaster/assets/fonts/lineseedsansth_rg.woff2" public/fonts/
```
Expected: `public/fonts/lineseedsansth_rg.woff2` exists. If the file is missing, skip it and keep the fallback fonts in CSS.

- [ ] **Step 2: Write `src/styles/tokens.css`** (values come from `DESIGN.md` section 2)

```css
@font-face {
  font-family: 'line_seed_sans_th';
  src: url('/fonts/lineseedsansth_rg.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
:root {
  --bg: #EEE9DF; --surface: #DDD7CA; --surface-2: #C9C1B1;
  --card-dark: #2C3B4D; --card-dark-2: #3D4B5B;
  --text: #1B2632; --muted: rgba(27, 38, 50, .72); --line: rgba(27, 38, 50, .16);
  --on-dark: #EEE9DF; --on-dark-muted: rgba(238, 233, 223, .72); --line-dark: rgba(238, 233, 223, .16);
  --accent: #FFB162; --warn: #A35139; --good: #2C3B4D; --chart-5: #7D7769;
  --radius: 14px; --radius-lg: 22px;
  --ease: cubic-bezier(.4, 0, .2, 1); --dur: .16s;
  --font: 'line_seed_sans_th', 'Inter', 'IBM Plex Sans Thai', system-ui, sans-serif;
}
```

- [ ] **Step 3: Write `src/styles/base.css`**

```css
* { box-sizing: border-box; font-weight: 400; font-synthesis: none; text-transform: none; margin: 0; }
html, body, #root { height: 100%; }
body { background: var(--bg); color: var(--text); font: 16px/1.5 var(--font); -webkit-text-size-adjust: 100%; }
html[lang='th'] body { line-height: 1.7; }
button, input, select, textarea { font: inherit; color: inherit; }
a { color: inherit; text-decoration: none; }
.num { font-variant-numeric: tabular-nums; }
.muted { color: var(--muted); }
.warn { color: var(--warn); }
.h1 { font-size: 24px; } .h2 { font-size: 18px; } .small { font-size: 14px; }
.display { font-size: 40px; line-height: 1.1; }

.app { min-height: 100%; display: flex; flex-direction: column; }
.topbar { height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; padding-top: env(safe-area-inset-top); }
.avatar { width: 36px; height: 36px; border-radius: 999px; background: var(--card-dark); color: var(--on-dark); display: grid; place-items: center; border: 0; cursor: pointer; }
.main { flex: 1; padding: 8px 20px 96px; width: 100%; max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
.tabbar { position: fixed; left: 0; right: 0; bottom: 0; height: calc(64px + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom); background: var(--card-dark); display: flex; z-index: 10; }
.tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: var(--on-dark-muted); font-size: 12px; position: relative; min-height: 44px; transition: color var(--dur) var(--ease); }
.tab.active { color: var(--accent); }
.tab.active::before { content: ''; position: absolute; top: 0; width: 28px; height: 3px; border-radius: 999px; background: var(--accent); }

.card { background: var(--surface); border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.card-dark { background: var(--card-dark); color: var(--on-dark); }
.card-dark .muted { color: var(--on-dark-muted); }
.card-dark .accent { color: var(--accent); }
.joined { background: var(--surface); border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column; }
.joined > * { padding: 16px 20px; border-top: 1px solid var(--line); }
.joined > *:first-child { border-top: 0; }
.row { display: flex; align-items: center; gap: 12px; min-height: 56px; cursor: pointer; transition: background var(--dur) var(--ease); }
.row:hover, .row:focus-visible { background: var(--surface-2); }
.row .grow { flex: 1; min-width: 0; }
.row .val { text-align: right; }

.btn { border: 0; border-radius: var(--radius); min-height: 52px; padding: 0 20px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: background var(--dur) var(--ease); width: 100%; }
.btn-primary { background: var(--accent); color: var(--text); }
.btn-primary:hover, .btn-primary:focus-visible { background: #E9A15A; }
.btn-secondary { background: var(--surface); color: var(--text); }
.btn-secondary:hover { background: var(--surface-2); }
.btn-danger { background: var(--warn); color: var(--bg); }
.btn-text { background: none; width: auto; min-height: 44px; padding: 0 8px; }
.btn-text:hover, .btn-text:focus-visible { text-decoration: underline; }
.btn[disabled] { opacity: .5; cursor: not-allowed; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { color: var(--muted); font-size: 14px; }
.input { background: var(--surface); border: 0; border-radius: var(--radius); min-height: 52px; padding: 0 16px; width: 100%; }
.input:focus-visible { background: var(--surface-2); outline: none; }
.err { color: var(--warn); font-size: 16px; display: flex; gap: 6px; align-items: center; }

.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chip { background: var(--surface); border: 0; border-radius: 999px; min-height: 36px; padding: 0 14px; font-size: 14px; cursor: pointer; }
.chip.on { background: var(--card-dark); color: var(--on-dark); }
.steps { display: flex; gap: 8px; justify-content: center; }
.steps i { width: 10px; height: 10px; border-radius: 999px; background: var(--line); }
.steps i.past { background: var(--card-dark); } .steps i.now { background: var(--text); }

.bar { height: 8px; border-radius: 999px; background: var(--surface-2); overflow: hidden; }
.bar > i { display: block; height: 100%; background: var(--good); }
.bar.short > i { background: var(--warn); }
.stack { display: flex; height: 12px; border-radius: 999px; overflow: hidden; background: var(--surface-2); }
.legend { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
.legend div { display: flex; justify-content: space-between; gap: 8px; }
.legend i { display: inline-block; width: 10px; height: 10px; border-radius: 999px; margin-right: 8px; }

.badge { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; }
.dot { width: 10px; height: 10px; border-radius: 999px; background: var(--good); display: inline-block; }
.dot.warn { background: var(--warn); }
.dot.hollow { background: transparent; box-shadow: inset 0 0 0 2px var(--muted); }

.sheet-back { position: fixed; inset: 0; background: rgba(27, 38, 50, .5); z-index: 20; display: flex; align-items: flex-end; justify-content: center; }
.sheet { background: var(--bg); width: 100%; max-width: 560px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; padding: 16px 20px calc(24px + env(safe-area-inset-bottom)); display: flex; flex-direction: column; gap: 14px; max-height: 90vh; overflow: auto; }
.sheet::before { content: ''; width: 40px; height: 4px; border-radius: 999px; background: var(--line); align-self: center; }
.chat { display: flex; flex-direction: column; gap: 10px; }
.msg { padding: 12px 16px; border-radius: var(--radius-lg); max-width: 88%; }
.msg.user { background: var(--card-dark); color: var(--on-dark); align-self: flex-end; }
.msg.ai { background: var(--surface); align-self: flex-start; }

@media (min-width: 900px) {
  .app { flex-direction: row; }
  .topbar { position: fixed; top: 0; right: 0; left: 88px; z-index: 5; }
  .tabbar { top: 0; bottom: 0; right: auto; width: 88px; height: auto; flex-direction: column; justify-content: flex-start; padding-top: 24px; gap: 8px; }
  .tab { flex: 0 0 auto; min-height: 64px; width: 100%; }
  .tab.active::before { top: 12px; left: 0; width: 3px; height: 28px; }
  .main { margin-left: 88px; max-width: 1120px; padding: 72px 32px 32px; width: calc(100% - 88px); }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
}
@media (min-width: 1200px) {
  .tabbar { width: 220px; align-items: stretch; }
  .tab { flex-direction: row; justify-content: flex-start; gap: 12px; padding: 0 24px; font-size: 16px; }
  .topbar { left: 220px; }
  .main { margin-left: 220px; width: calc(100% - 220px); }
  .display { font-size: 56px; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
```

- [ ] **Step 4: Write `src/components/Icon.tsx`**

```tsx
const PATHS: Record<string, string> = {
  home: 'M10 30 L32 10 L54 30 M16 26 V52 H48 V26',
  chart: 'M12 52 V12 M12 52 H54 M20 40 L30 28 L38 36 L50 18',
  doc: 'M16 8 H38 L48 18 V56 H16 Z M38 8 V18 H48 M24 30 H40 M24 40 H40',
  wallet: 'M8 18 H52 V50 H8 Z M8 18 L40 10 V18 M38 34 H52',
  person: 'M32 30 A9 9 0 1 0 32 12 A9 9 0 1 0 32 30 M12 54 C12 42 52 42 52 54',
  mic: 'M32 10 A8 8 0 0 1 40 18 V30 A8 8 0 0 1 24 30 V18 A8 8 0 0 1 32 10 M18 28 C18 44 46 44 46 28 M32 44 V54',
  send: 'M10 32 L54 12 L40 52 L32 36 Z',
  camera: 'M10 22 H20 L24 16 H40 L44 22 H54 V50 H10 Z M32 42 A8 8 0 1 0 32 26 A8 8 0 1 0 32 42',
  upload: 'M32 44 V14 M20 26 L32 14 L44 26 M12 50 H52',
  plus: 'M32 12 V52 M12 32 H52',
  back: 'M40 12 L20 32 L40 52',
  check: 'M14 34 L26 46 L50 18',
  warn: 'M32 10 L56 52 H8 Z M32 26 V38 M32 44 V46',
  globe: 'M32 10 A22 22 0 1 0 32 54 A22 22 0 1 0 32 10 M10 32 H54 M32 10 C20 22 20 42 32 54 C44 42 44 22 32 10',
  chat: 'M10 14 H54 V42 H30 L18 52 V42 H10 Z',
  edit: 'M12 52 L16 38 L40 14 L50 24 L26 48 Z',
  bank: 'M8 26 L32 10 L56 26 H8 Z M14 30 V46 M26 30 V46 M38 30 V46 M50 30 V46 M8 52 H56',
}

export function Icon({ name, size = 24 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2.6}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] ?? ''} />
    </svg>
  )
}
```

- [ ] **Step 5: Write `src/components/Shell.tsx`**

```tsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useT, type Key } from '../i18n'
import { useApp } from '../store/useApp'
import { Icon } from './Icon'

const TABS: { to: string; icon: string; label: Key }[] = [
  { to: '/', icon: 'home', label: 'nav.home' },
  { to: '/invest', icon: 'chart', label: 'nav.invest' },
  { to: '/tax', icon: 'doc', label: 'nav.tax' },
  { to: '/debt', icon: 'wallet', label: 'nav.debt' },
]

export function Shell() {
  const t = useT()
  const nav = useNavigate()
  const name = useApp((s) => s.profile?.displayName) ?? ''
  return (
    <div className="app">
      <header className="topbar">
        <span className="h2">{t('app.name')}</span>
        <button className="avatar" aria-label={t('profile.title')} onClick={() => nav('/profile')}>
          {name ? name.slice(0, 1) : <Icon name="person" size={20} />}
        </button>
      </header>
      <main className="main"><Outlet /></main>
      <nav className="tabbar" aria-label="Main">
        {TABS.map((x) => (
          <NavLink key={x.to} to={x.to} end={x.to === '/'} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            <Icon name={x.icon} size={28} />
            <span>{t(x.label)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
```

- [ ] **Step 6: Write `src/App.tsx` with placeholder screens**

```tsx
import { useEffect, type ReactElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { useT } from './i18n'
import { useApp } from './store/useApp'

const Todo = ({ name }: { name: string }) => <p className="muted">{name}</p>

function Guard({ children }: { children: ReactElement }) {
  const { ready, userId, profile } = useApp()
  const t = useT()
  if (!ready) return <p className="muted" style={{ padding: 20 }}>{t('common.loading')}</p>
  if (!userId) return <Navigate to="/signin" replace />
  if (!profile?.onboardedAt) return <Navigate to="/onboarding/1" replace />
  return children
}

export default function App() {
  const init = useApp((s) => s.init)
  const lang = useApp((s) => s.lang)
  useEffect(() => { void init() }, [init])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<Todo name="signin" />} />
        <Route path="/onboarding/:step" element={<Todo name="onboarding" />} />
        <Route element={<Guard><Shell /></Guard>}>
          <Route index element={<Todo name="home" />} />
          <Route path="invest" element={<Todo name="invest" />} />
          <Route path="tax" element={<Todo name="tax" />} />
          <Route path="debt" element={<Todo name="debt" />} />
          <Route path="profile" element={<Todo name="profile" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```
Later tasks replace each `Todo` with the real screen and add the remaining routes.

- [ ] **Step 7: Update `src/main.tsx`**

```tsx
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import App from './App'

createRoot(document.getElementById('root')!).render(<App />)
```

- [ ] **Step 8: Verify**

Run: `npm run typecheck` then `npm run build`
Expected: both succeed. Run `npm run dev` and open the printed URL: expected redirect to `/signin` showing the text `signin`. Stop the dev server.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(ui): palette tokens, base styles, icons and app shell"
```

---

### Task 10: Sign in, onboarding and profile

**Files:**
- Create: `src/components/Field.tsx`, `src/components/ProfileForm.tsx`, `src/components/LangToggle.tsx`, `src/screens/SignIn.tsx`, `src/screens/Onboarding.tsx`, `src/screens/Profile.tsx`, `src/lib/validate.ts`, `src/lib/validate.test.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useApp`, `useT`, `supabase`
- Produces:
  - `validateProfile(p: Partial<Profile>, fields: ProfileField[], now?: Date): Partial<Record<ProfileField, 'required' | 'invalid'>>` with `type ProfileField = 'displayName' | 'birthYear' | 'householdSize' | 'incomeType' | 'monthlyIncome' | 'otherIncome' | 'payDay' | 'retireAge' | 'postRetireIncome' | 'monthlyEssentials'`
  - `<ProfileForm fields value onChange errors />`, `<LangToggle />`

- [ ] **Step 1: Write the failing test `src/lib/validate.test.ts`**

```ts
import { expect, test } from 'vitest'
import { validateProfile } from './validate'

const now = new Date(Date.UTC(2026, 9, 15))

test('required fields are reported when missing', () => {
  const e = validateProfile({}, ['birthYear', 'monthlyIncome', 'retireAge'], now)
  expect(e).toEqual({ birthYear: 'required', monthlyIncome: 'required', retireAge: 'required' })
})
test('valid values produce no errors', () => {
  expect(validateProfile({ birthYear: 1988, monthlyIncome: 52000, retireAge: 60 }, ['birthYear', 'monthlyIncome', 'retireAge'], now)).toEqual({})
})
test('birth year must be a plausible Gregorian year', () => {
  expect(validateProfile({ birthYear: 2531 }, ['birthYear'], now).birthYear).toBe('invalid')
  expect(validateProfile({ birthYear: 1850 }, ['birthYear'], now).birthYear).toBe('invalid')
})
test('income cannot be negative', () => {
  expect(validateProfile({ monthlyIncome: -1 }, ['monthlyIncome'], now).monthlyIncome).toBe('invalid')
})
test('retirement age must be above the current age', () => {
  expect(validateProfile({ birthYear: 1980, retireAge: 40 }, ['retireAge'], now).retireAge).toBe('invalid')
  expect(validateProfile({ birthYear: 1980, retireAge: 60 }, ['retireAge'], now).retireAge).toBeUndefined()
})
test('optional fields may be empty but not negative', () => {
  expect(validateProfile({}, ['monthlyEssentials'], now)).toEqual({})
  expect(validateProfile({ monthlyEssentials: -5 }, ['monthlyEssentials'], now).monthlyEssentials).toBe('invalid')
})
```

- [ ] **Step 2: Run to verify FAIL**

Run: `npx vitest run src/lib/validate.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write `src/lib/validate.ts`**

```ts
import type { Profile } from '../store/types'

export type ProfileField =
  | 'displayName' | 'birthYear' | 'householdSize' | 'incomeType' | 'monthlyIncome'
  | 'otherIncome' | 'payDay' | 'retireAge' | 'postRetireIncome' | 'monthlyEssentials'

const REQUIRED: ProfileField[] = ['birthYear', 'monthlyIncome', 'retireAge']

export function validateProfile(
  p: Partial<Profile>,
  fields: ProfileField[],
  now: Date = new Date(),
): Partial<Record<ProfileField, 'required' | 'invalid'>> {
  const out: Partial<Record<ProfileField, 'required' | 'invalid'>> = {}
  const year = now.getUTCFullYear()
  for (const f of fields) {
    const v = p[f]
    const empty = v === null || v === undefined || v === ''
    if (empty) { if (REQUIRED.includes(f)) out[f] = 'required'; continue }
    if (typeof v === 'number') {
      if (!Number.isFinite(v) || v < 0) out[f] = 'invalid'
      if (f === 'birthYear' && (v < 1900 || v > year)) out[f] = 'invalid'
      if (f === 'payDay' && (v < 1 || v > 31)) out[f] = 'invalid'
      if (f === 'retireAge') {
        const age = p.birthYear ? year - p.birthYear : 0
        if (v <= age || v > 100) out[f] = 'invalid'
      }
    }
  }
  return out
}
```

- [ ] **Step 4: Run to verify PASS**

Run: `npx vitest run src/lib/validate.test.ts`
Expected: PASS.

- [ ] **Step 5: Write `src/components/Field.tsx`**

```tsx
import type { InputHTMLAttributes, ReactNode } from 'react'
import { useT } from '../i18n'
import { Icon } from './Icon'

export function Field({ label, error, children }: { label: string; error?: 'required' | 'invalid'; children: ReactNode }) {
  const t = useT()
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error && (
        <span className="err" role="alert"><Icon name="warn" size={18} />{t(error === 'required' ? 'field.required' : 'field.invalid')}</span>
      )}
    </div>
  )
}

export function NumInput({ value, onChange, ...rest }: { value: number | null | undefined; onChange: (v: number | null) => void } & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <input className="input num" inputMode="decimal" value={value ?? ''}
      onChange={(e) => { const s = e.target.value; onChange(s === '' ? null : Number(s)) }} {...rest} />
  )
}
```

- [ ] **Step 6: Write `src/components/LangToggle.tsx`**

```tsx
import { useApp } from '../store/useApp'
import { Icon } from './Icon'

export function LangToggle() {
  const { lang, setLang } = useApp()
  return (
    <button className="btn btn-text" aria-pressed={lang === 'en'} onClick={() => setLang(lang === 'th' ? 'en' : 'th')}>
      <Icon name="globe" size={20} />{lang === 'th' ? 'EN' : 'TH'}
    </button>
  )
}
```

- [ ] **Step 7: Write `src/components/ProfileForm.tsx`**

```tsx
import { useT } from '../i18n'
import type { ProfileField } from '../lib/validate'
import type { Profile } from '../store/types'
import { Field, NumInput } from './Field'

interface Props {
  fields: ProfileField[]
  value: Partial<Profile>
  onChange: (patch: Partial<Profile>) => void
  errors: Partial<Record<ProfileField, 'required' | 'invalid'>>
}

export function ProfileForm({ fields, value, onChange, errors }: Props) {
  const t = useT()
  const has = (f: ProfileField) => fields.includes(f)
  return (
    <>
      {has('displayName') && (
        <Field label={t('field.displayName')} error={errors.displayName}>
          <input className="input" value={value.displayName ?? ''} onChange={(e) => onChange({ displayName: e.target.value })} />
        </Field>
      )}
      {has('birthYear') && (
        <Field label={t('field.birthYear')} error={errors.birthYear}>
          <NumInput value={value.birthYear} onChange={(v) => onChange({ birthYear: v })} placeholder="1990" />
        </Field>
      )}
      {has('householdSize') && (
        <Field label={t('field.household')} error={errors.householdSize}>
          <NumInput value={value.householdSize} onChange={(v) => onChange({ householdSize: v })} />
        </Field>
      )}
      {has('incomeType') && (
        <Field label={t('field.incomeType')}>
          <div className="chips">
            {(['salary', 'freelance', 'both'] as const).map((k) => (
              <button key={k} type="button" className={`chip${value.incomeType === k ? ' on' : ''}`} onClick={() => onChange({ incomeType: k })}>
                {t(`field.income.${k}` as const)}
              </button>
            ))}
          </div>
        </Field>
      )}
      {has('monthlyIncome') && (
        <Field label={t('field.monthlyIncome')} error={errors.monthlyIncome}>
          <NumInput value={value.monthlyIncome} onChange={(v) => onChange({ monthlyIncome: v })} />
        </Field>
      )}
      {has('otherIncome') && (
        <Field label={t('field.otherIncome')} error={errors.otherIncome}>
          <NumInput value={value.otherIncome} onChange={(v) => onChange({ otherIncome: v ?? 0 })} />
        </Field>
      )}
      {has('payDay') && (
        <Field label={t('field.payDay')} error={errors.payDay}>
          <NumInput value={value.payDay} onChange={(v) => onChange({ payDay: v })} />
        </Field>
      )}
      {has('retireAge') && (
        <Field label={t('field.retireAge')} error={errors.retireAge}>
          <NumInput value={value.retireAge} onChange={(v) => onChange({ retireAge: v })} placeholder="60" />
        </Field>
      )}
      {has('postRetireIncome') && (
        <Field label={t('field.postRetire')} error={errors.postRetireIncome}>
          <NumInput value={value.postRetireIncome} onChange={(v) => onChange({ postRetireIncome: v })} />
        </Field>
      )}
      {has('monthlyEssentials') && (
        <Field label={t('field.essentials')} error={errors.monthlyEssentials}>
          <NumInput value={value.monthlyEssentials} onChange={(v) => onChange({ monthlyEssentials: v })} />
        </Field>
      )}
    </>
  )
}
```

- [ ] **Step 8: Write `src/screens/SignIn.tsx`**

```tsx
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LangToggle } from '../components/LangToggle'
import { useT } from '../i18n'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/useApp'

export default function SignIn() {
  const t = useT()
  const userId = useApp((s) => s.userId)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  if (userId) return <Navigate to="/" replace />

  const google = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  const magic = async () => {
    setError(false)
    const { error: e } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    if (e) setError(true); else setSent(true)
  }
  return (
    <div className="app" style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="main" style={{ justifyContent: 'center', paddingBottom: 20 }}>
        <div style={{ alignSelf: 'flex-end' }}><LangToggle /></div>
        <h1 className="h1">{t('app.name')}</h1>
        <p className="muted">{t('signin.line')}</p>
        <button className="btn btn-primary" onClick={google}>{t('signin.google')}</button>
        <div className="field">
          <label>{t('signin.email')}</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <button className="btn btn-secondary" disabled={!email.includes('@')} onClick={magic}>{t('signin.emailSend')}</button>
        {sent && <p role="status">{t('signin.emailSent')}</p>}
        {error && <p className="err" role="alert">{t('common.error')}</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Write `src/screens/Onboarding.tsx`**

```tsx
import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { LangToggle } from '../components/LangToggle'
import { ProfileForm } from '../components/ProfileForm'
import { useT, type Key } from '../i18n'
import { validateProfile, type ProfileField } from '../lib/validate'
import { loadDemo } from '../lib/demo'
import { useApp } from '../store/useApp'
import type { Profile } from '../store/types'

const STEPS: { title: Key; fields: ProfileField[] }[] = [
  { title: 'onb.aboutTitle', fields: ['displayName', 'birthYear', 'householdSize'] },
  { title: 'onb.incomeTitle', fields: ['incomeType', 'monthlyIncome', 'otherIncome', 'payDay'] },
  { title: 'onb.retireTitle', fields: ['retireAge', 'postRetireIncome'] },
  { title: 'onb.essentialsTitle', fields: ['monthlyEssentials'] },
  { title: 'onb.debtsTitle', fields: [] },
]

export default function Onboarding() {
  const t = useT()
  const nav = useNavigate()
  const { step: raw } = useParams()
  const { userId, store, profile, refresh } = useApp()
  const step = Math.min(Math.max(Number(raw) || 1, 1), STEPS.length)
  const [value, setValue] = useState<Partial<Profile>>({ otherIncome: 0, ...(profile ?? {}) })
  const [errors, setErrors] = useState<ReturnType<typeof validateProfile>>({})
  if (!userId) return <Navigate to="/signin" replace />
  const cur = STEPS[step - 1]

  const next = async () => {
    const e = validateProfile(value, cur.fields)
    setErrors(e)
    if (Object.keys(e).length) return
    await store!.saveProfile(value)
    if (step < STEPS.length) nav(`/onboarding/${step + 1}`)
  }
  const finish = async (to: string) => {
    await store!.saveProfile({ ...value, onboardedAt: new Date().toISOString() })
    await refresh()
    nav(to)
  }
  const demo = async () => {
    await loadDemo(store!)
    await refresh()
    nav('/')
  }

  return (
    <div className="app" style={{ alignItems: 'center' }}>
      <div className="main" style={{ paddingBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 1 ? <button className="btn btn-text" onClick={() => nav(`/onboarding/${step - 1}`)}>{t('common.back')}</button> : <span />}
          <LangToggle />
        </div>
        <div className="steps" aria-label={t('onb.step', { n: step, total: STEPS.length })}>
          {STEPS.map((_, i) => <i key={i} className={i + 1 < step ? 'past' : i + 1 === step ? 'now' : ''} />)}
        </div>
        <h1 className="h1">{t(cur.title)}</h1>
        {step < STEPS.length ? (
          <>
            <ProfileForm fields={cur.fields} value={value} errors={errors} onChange={(p) => setValue((v) => ({ ...v, ...p }))} />
            {step === 4 && <button className="btn btn-text" onClick={() => nav('/onboarding/5')}>{t('common.later')}</button>}
            <button className="btn btn-primary" onClick={next}>{t('common.next')}</button>
          </>
        ) : (
          <>
            <p className="muted">{t('onb.debtsLine')}</p>
            <button className="btn btn-primary" onClick={() => finish('/debt/add')}>{t('onb.addNow')}</button>
            <button className="btn btn-secondary" onClick={() => finish('/')}>{t('common.later')}</button>
            <button className="btn btn-text" onClick={demo}>{t('profile.loadDemo')} ({t('common.demo')})</button>
          </>
        )}
      </div>
    </div>
  )
}
```

This file imports `loadDemo` from `src/lib/demo.ts`, written in Task 16. Create a temporary stub now so the build passes:

`src/lib/demo.ts`:
```ts
import type { DataStore } from '../store/types'

export async function loadDemo(_store: DataStore): Promise<void> {
  throw new Error('loadDemo is implemented in Task 16')
}
```

- [ ] **Step 10: Write `src/screens/Profile.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LangToggle } from '../components/LangToggle'
import { ProfileForm } from '../components/ProfileForm'
import { useT } from '../i18n'
import { loadDemo, removeDemo } from '../lib/demo'
import { validateProfile, type ProfileField } from '../lib/validate'
import { useApp } from '../store/useApp'
import type { Profile } from '../store/types'

const ALL: ProfileField[] = ['displayName', 'birthYear', 'householdSize', 'incomeType', 'monthlyIncome', 'otherIncome', 'payDay', 'retireAge', 'postRetireIncome', 'monthlyEssentials']

export default function ProfileScreen() {
  const t = useT()
  const nav = useNavigate()
  const { store, profile, refresh, signOut } = useApp()
  const [value, setValue] = useState<Partial<Profile>>(profile ?? {})
  const [errors, setErrors] = useState<ReturnType<typeof validateProfile>>({})
  const [saved, setSaved] = useState(false)
  const [confirm, setConfirm] = useState('')

  const save = async () => {
    const e = validateProfile(value, ALL)
    setErrors(e)
    if (Object.keys(e).length) return
    await store!.saveProfile(value)
    await refresh()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }
  const exportData = async () => {
    const blob = new Blob([JSON.stringify(await store!.exportAll(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'debtwise-export.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const wipe = async () => {
    await store!.deleteAll()
    await signOut()
    nav('/signin')
  }

  return (
    <>
      <h1 className="h1">{t('profile.title')}</h1>
      <div className="card">
        <ProfileForm fields={ALL} value={value} errors={errors} onChange={(p) => setValue((v) => ({ ...v, ...p }))} />
        <button className="btn btn-primary" onClick={save}>{t('common.save')}</button>
        {saved && <p role="status">{t('profile.saved')}</p>}
      </div>
      <div className="card">
        <span>{t('profile.language')}</span>
        <LangToggle />
      </div>
      <div className="card">
        <h2 className="h2">{t('profile.data')}</h2>
        <p className="muted">{t('profile.dataLine')}</p>
        <button className="btn btn-secondary" onClick={exportData}>{t('profile.export')}</button>
        <button className="btn btn-secondary" onClick={async () => { await loadDemo(store!); await refresh() }}>{t('profile.loadDemo')} ({t('common.demo')})</button>
        <button className="btn btn-secondary" onClick={async () => { await removeDemo(store!); await refresh() }}>{t('profile.removeDemo')}</button>
        <p className="muted small">{t('profile.deleteConfirm')}</p>
        <input className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button className="btn btn-danger" disabled={confirm.trim().toLowerCase() !== 'delete'} onClick={wipe}>{t('profile.deleteAll')}</button>
      </div>
      <button className="btn btn-secondary" onClick={async () => { await signOut(); nav('/signin') }}>{t('profile.signOut')}</button>
    </>
  )
}
```
Add `removeDemo` to the stub in `src/lib/demo.ts`:
```ts
export async function removeDemo(store: DataStore): Promise<void> {
  await store.deleteSampleData()
}
```

- [ ] **Step 11: Wire routes in `src/App.tsx`**

Replace the `signin`, `onboarding` and `profile` `Todo` elements:
```tsx
import SignIn from './screens/SignIn'
import Onboarding from './screens/Onboarding'
import ProfileScreen from './screens/Profile'
// ...
<Route path="/signin" element={<SignIn />} />
<Route path="/onboarding/:step" element={<Onboarding />} />
// inside the Shell route:
<Route path="profile" element={<ProfileScreen />} />
```

- [ ] **Step 12: Verify**

Run: `npm test` then `npm run typecheck` then `npm run build`
Expected: all succeed. Manual check, tell the user to run `npm run dev` after Supabase auth providers are enabled (Part 1, Task 6, Step 4): sign in, complete onboarding, see Home placeholder, open Profile from the avatar, edit income, save.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat(auth): sign in, onboarding steps and editable profile"
```

---

### Task 11: Debt screens

**Files:**
- Create: `src/lib/group.ts`, `src/lib/group.test.ts`, `src/components/StackedBar.tsx`, `src/components/Badge.tsx`, `src/components/DebtForm.tsx`, `src/screens/Debt.tsx`, `src/screens/DebtGroup.tsx`, `src/screens/LoanDetail.tsx`, `src/screens/AddDebt.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `Debt`, `DebtType`, `formatBaht` from `src/engine`; `useApp`, `useT`
- Produces:
  - `groupDebts(debts: Debt[], by: 'bank' | 'type'): Group[]` with `Group { key: string; total: number; monthly: number; byType: Partial<Record<DebtType, number>>; debts: Debt[] }`
  - `TYPE_COLOR: Record<DebtType, string>` (CSS variable strings)
  - `<StackedBar byType total />`, `<Badge status />`, `<DebtForm initial onSave onCancel />`

- [ ] **Step 1: Write the failing test `src/lib/group.test.ts`**

```ts
import { expect, test } from 'vitest'
import type { Debt } from '../engine'
import { groupDebts } from './group'

const d = (id: string, lender: string, type: Debt['type'], balance: number, min: number): Debt => ({
  id, lender, type, label: id, balance, ratePct: 5, minPayment: min, dueDay: 1, termMonthsLeft: null, status: 'verified', sourceId: null,
})
const debts = [d('1', 'A', 'credit_card', 60000, 1800), d('2', 'A', 'car', 400000, 9000), d('3', 'B', 'home', 900000, 7000)]

test('groups by bank, largest total first, with a per type split', () => {
  const g = groupDebts(debts, 'bank')
  expect(g.map((x) => x.key)).toEqual(['B', 'A'])
  expect(g[1].total).toBe(460000)
  expect(g[1].monthly).toBe(10800)
  expect(g[1].byType).toEqual({ credit_card: 60000, car: 400000 })
})
test('groups by type', () => {
  const g = groupDebts(debts, 'type')
  expect(g.map((x) => x.key)).toEqual(['home', 'car', 'credit_card'])
})
test('an empty list returns no groups', () => {
  expect(groupDebts([], 'bank')).toEqual([])
})
```

- [ ] **Step 2: Run to verify FAIL, then write `src/lib/group.ts`**

Run: `npx vitest run src/lib/group.test.ts` Expected: FAIL.

```ts
import type { Debt, DebtType } from '../engine'

export interface Group {
  key: string
  total: number
  monthly: number
  byType: Partial<Record<DebtType, number>>
  debts: Debt[]
}

export const TYPE_COLOR: Record<DebtType, string> = {
  credit_card: 'var(--warn)',
  personal: 'var(--accent)',
  car: 'var(--card-dark)',
  home: 'var(--text)',
  student: 'var(--chart-5)',
  informal: 'var(--chart-5)',
}

export function groupDebts(debts: Debt[], by: 'bank' | 'type'): Group[] {
  const map = new Map<string, Group>()
  for (const d of debts) {
    const key = by === 'bank' ? d.lender : d.type
    const g = map.get(key) ?? { key, total: 0, monthly: 0, byType: {}, debts: [] }
    g.total += d.balance
    g.monthly += d.minPayment
    g.byType[d.type] = (g.byType[d.type] ?? 0) + d.balance
    g.debts.push(d)
    map.set(key, g)
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}
```
Run: `npx vitest run src/lib/group.test.ts` Expected: PASS.

- [ ] **Step 3: Write `src/components/StackedBar.tsx` and `src/components/Badge.tsx`**

`StackedBar.tsx`:
```tsx
import type { DebtType } from '../engine'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { TYPE_COLOR } from '../lib/group'

export function StackedBar({ byType, total }: { byType: Partial<Record<DebtType, number>>; total: number }) {
  const t = useT()
  const entries = (Object.entries(byType) as [DebtType, number][]).filter(([, v]) => v > 0)
  return (
    <div>
      <div className="stack" role="img" aria-label={entries.map(([k, v]) => `${t(`type.${k}` as const)} ${formatBaht(v)}`).join(', ')}>
        {entries.map(([k, v]) => <i key={k} style={{ width: `${(v / (total || 1)) * 100}%`, background: TYPE_COLOR[k] }} />)}
      </div>
      <div className="legend" style={{ marginTop: 8 }}>
        {entries.map(([k, v]) => (
          <div key={k}><span><i style={{ background: TYPE_COLOR[k] }} />{t(`type.${k}` as const)}</span><span className="num">{formatBaht(v)}</span></div>
        ))}
      </div>
    </div>
  )
}
```
`Badge.tsx`:
```tsx
import { useT } from '../i18n'

export function Badge({ status }: { status: 'verified' | 'needs_review' | 'user_stated' | 'sample' }) {
  const t = useT()
  const cls = status === 'verified' ? 'dot' : status === 'needs_review' ? 'dot warn' : 'dot hollow'
  return <span className="badge"><i className={cls} />{t(`status.${status}` as const)}</span>
}
```

- [ ] **Step 4: Write `src/components/DebtForm.tsx`**

```tsx
import { useState } from 'react'
import type { DebtType } from '../engine'
import { useT } from '../i18n'
import type { DebtInput } from '../store/types'
import { Field, NumInput } from './Field'

const TYPES: DebtType[] = ['credit_card', 'personal', 'car', 'home', 'student', 'informal']

export function DebtForm({ initial, onSave, onCancel }: { initial?: Partial<DebtInput>; onSave: (d: DebtInput) => void | Promise<void>; onCancel: () => void }) {
  const t = useT()
  const [v, setV] = useState<Partial<DebtInput>>({ type: 'personal', status: 'user_stated', sourceId: null, ...initial })
  const [tried, setTried] = useState(false)
  const bad = {
    lender: !v.lender?.trim(),
    balance: v.balance == null || v.balance < 0,
    minPayment: v.minPayment == null || v.minPayment < 0,
    ratePct: v.ratePct != null && (v.ratePct < 0 || v.ratePct > 100),
    dueDay: v.dueDay != null && (v.dueDay < 1 || v.dueDay > 31),
  }
  const submit = async () => {
    setTried(true)
    if (Object.values(bad).some(Boolean)) return
    await onSave({
      lender: v.lender!.trim(), type: v.type as DebtType, label: v.label?.trim() || t(`type.${v.type as DebtType}` as const),
      balance: v.balance!, ratePct: v.ratePct ?? null, minPayment: v.minPayment!, dueDay: v.dueDay ?? null,
      termMonthsLeft: v.termMonthsLeft ?? null, status: v.status ?? 'user_stated', sourceId: v.sourceId ?? null,
    })
  }
  const e = (k: keyof typeof bad): 'required' | 'invalid' | undefined => (tried && bad[k] ? (k === 'lender' || k === 'balance' || k === 'minPayment' ? 'required' : 'invalid') : undefined)
  return (
    <>
      <Field label={t('debt.type')}>
        <div className="chips">
          {TYPES.map((k) => <button key={k} type="button" className={`chip${v.type === k ? ' on' : ''}`} onClick={() => setV({ ...v, type: k })}>{t(`type.${k}` as const)}</button>)}
        </div>
      </Field>
      <Field label={t('debt.lender')} error={e('lender')}><input className="input" value={v.lender ?? ''} onChange={(x) => setV({ ...v, lender: x.target.value })} /></Field>
      <Field label={t('debt.label')}><input className="input" value={v.label ?? ''} onChange={(x) => setV({ ...v, label: x.target.value })} /></Field>
      <Field label={t('debt.balance')} error={e('balance')}><NumInput value={v.balance} onChange={(n) => setV({ ...v, balance: n ?? undefined })} /></Field>
      <Field label={t('debt.rate')} error={e('ratePct')}><NumInput value={v.ratePct} onChange={(n) => setV({ ...v, ratePct: n })} /></Field>
      <Field label={t('debt.minPayment')} error={e('minPayment')}><NumInput value={v.minPayment} onChange={(n) => setV({ ...v, minPayment: n ?? undefined })} /></Field>
      <Field label={t('debt.dueDay')} error={e('dueDay')}><NumInput value={v.dueDay} onChange={(n) => setV({ ...v, dueDay: n })} /></Field>
      <Field label={t('debt.termLeft')}><NumInput value={v.termMonthsLeft} onChange={(n) => setV({ ...v, termMonthsLeft: n })} /></Field>
      <button className="btn btn-primary" onClick={submit}>{t('common.save')}</button>
      <button className="btn btn-text" onClick={onCancel}>{t('common.cancel')}</button>
    </>
  )
}
```

- [ ] **Step 5: Write `src/screens/Debt.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StackedBar } from '../components/StackedBar'
import { Icon } from '../components/Icon'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { groupDebts } from '../lib/group'
import { useApp } from '../store/useApp'

export default function Debt() {
  const t = useT()
  const nav = useNavigate()
  const debts = useApp((s) => s.debts)
  const [by, setBy] = useState<'bank' | 'type'>('bank')
  const total = debts.reduce((s, d) => s + d.balance, 0)
  const monthly = debts.reduce((s, d) => s + d.minPayment, 0)
  const groups = groupDebts(debts, by)

  return (
    <>
      <div className="card card-dark">
        <span className="muted">{t('debt.totalOwed')}</span>
        <span className="display accent num">{formatBaht(total)}</span>
        <span className="muted">{t('debt.monthlyTotal')}: <span className="num">{formatBaht(monthly)}</span></span>
      </div>
      <div className="chips">
        <button className={`chip${by === 'bank' ? ' on' : ''}`} onClick={() => setBy('bank')}>{t('debt.byBank')}</button>
        <button className={`chip${by === 'type' ? ' on' : ''}`} onClick={() => setBy('type')}>{t('debt.byType')}</button>
      </div>
      {groups.length === 0 && <p className="muted">{t('debt.empty')}</p>}
      <div className="grid2">
        {groups.map((g) => (
          <div key={g.key} className="card row" role="link" tabIndex={0}
            onClick={() => nav(`/debt/group/${by}/${encodeURIComponent(g.key)}`)}
            onKeyDown={(e) => e.key === 'Enter' && nav(`/debt/group/${by}/${encodeURIComponent(g.key)}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span className="h2">{by === 'type' ? t(`type.${g.key}` as never) : g.key}</span>
              <span className="num">{formatBaht(g.total)}</span>
            </div>
            <StackedBar byType={g.byType} total={g.total} />
            <span className="muted small num">{total ? Math.round((g.total / total) * 100) : 0}% {t('debt.share')}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={() => nav('/debt/add')}><Icon name="plus" size={20} />{t('debt.add')}</button>
      <button className="btn btn-secondary" onClick={() => nav('/plan')}>{t('home.openPlan')}</button>
    </>
  )
}
```

- [ ] **Step 6: Write `src/screens/DebtGroup.tsx` and `src/screens/LoanDetail.tsx`**

`DebtGroup.tsx`:
```tsx
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { useApp } from '../store/useApp'

export default function DebtGroup() {
  const t = useT()
  const nav = useNavigate()
  const { by, key = '' } = useParams()
  const debts = useApp((s) => s.debts).filter((d) => (by === 'type' ? d.type === key : d.lender === key))
  return (
    <>
      <button className="btn btn-text" style={{ alignSelf: 'flex-start' }} onClick={() => nav('/debt')}>{t('common.back')}</button>
      <h1 className="h1">{by === 'type' ? t(`type.${key}` as never) : key}</h1>
      <div className="joined">
        {debts.map((d) => (
          <div key={d.id} className="row" role="link" tabIndex={0} onClick={() => nav(`/debt/loan/${d.id}`)} onKeyDown={(e) => e.key === 'Enter' && nav(`/debt/loan/${d.id}`)}>
            <div className="grow"><div>{d.label}</div><Badge status={d.status} /></div>
            <div className="val num">{formatBaht(d.balance)}</div>
          </div>
        ))}
      </div>
    </>
  )
}
```
`LoanDetail.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { DebtForm } from '../components/DebtForm'
import { Sheet } from '../components/Sheet'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { useApp } from '../store/useApp'
import type { Source } from '../store/types'

export default function LoanDetail() {
  const t = useT()
  const nav = useNavigate()
  const { id } = useParams()
  const { debts, store, refresh } = useApp()
  const d = debts.find((x) => x.id === id)
  const [src, setSrc] = useState<Source | null>(null)
  const [edit, setEdit] = useState(false)
  useEffect(() => {
    if (d?.sourceId && store) void store.getSources([d.sourceId]).then((s) => setSrc(s[0] ?? null))
  }, [d?.sourceId, store])
  if (!d) return <button className="btn btn-text" onClick={() => nav('/debt')}>{t('common.back')}</button>

  const sourceText = !d.sourceId ? t('debt.sourceYou') : src?.kind === 'sample' ? t('debt.sourceSample') : src?.lineText ? `${src.fileName ?? ''} ${src.lineText}` : t('debt.sourceNone')
  return (
    <>
      <button className="btn btn-text" style={{ alignSelf: 'flex-start' }} onClick={() => nav(-1)}>{t('common.back')}</button>
      <div className="card card-dark">
        <span className="muted">{d.lender}</span>
        <span className="h1">{d.label}</span>
        <span className="display accent num">{formatBaht(d.balance)}</span>
        <Badge status={d.status} />
      </div>
      <div className="joined">
        <div className="row"><span className="grow">{t('debt.rate')}</span><span className="num">{d.ratePct ?? '-'}</span></div>
        <div className="row"><span className="grow">{t('debt.minPayment')}</span><span className="num">{formatBaht(d.minPayment)}</span></div>
        <div className="row"><span className="grow">{t('debt.dueDay')}</span><span className="num">{d.dueDay ?? '-'}</span></div>
        <div className="row"><span className="grow">{t('debt.termLeft')}</span><span className="num">{d.termMonthsLeft ?? '-'}</span></div>
        <div className="row"><span className="grow">{t('debt.source')}</span><span className="small">{sourceText}</span></div>
      </div>
      <button className="btn btn-secondary" onClick={() => setEdit(true)}>{t('common.save')}</button>
      <button className="btn btn-danger" onClick={async () => { await store!.deleteDebt(d.id); await refresh(); nav('/debt') }}>{t('common.delete')}</button>
      {edit && (
        <Sheet onClose={() => setEdit(false)}>
          <DebtForm initial={d} onCancel={() => setEdit(false)} onSave={async (x) => {
            await store!.saveDebt({ ...x, id: d.id, status: 'user_stated' })
            await refresh(); setEdit(false)
          }} />
        </Sheet>
      )}
    </>
  )
}
```
Create `src/components/Sheet.tsx`:
```tsx
import type { ReactNode } from 'react'

export function Sheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="sheet-back" onClick={onClose} role="presentation">
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}
```
The edit button reuses the `common.save` label because the sheet it opens is the same form used for adding a debt.

- [ ] **Step 7: Write `src/screens/AddDebt.tsx`**

```tsx
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DebtForm } from '../components/DebtForm'
import { Icon } from '../components/Icon'
import { Sheet } from '../components/Sheet'
import { useT } from '../i18n'
import { useApp } from '../store/useApp'

export default function AddDebt() {
  const t = useT()
  const nav = useNavigate()
  const { store, refresh } = useApp()
  const [form, setForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const file = useRef<HTMLInputElement>(null)

  const onFile = async (f: File | undefined) => {
    if (!f) return
    setBusy(true); setError(false)
    try {
      const { extractDocument } = await import('../lib/ai')
      const candidates = await extractDocument(f)
      nav('/debt/review', { state: { candidates, fileName: f.name } })
    } catch { setError(true) } finally { setBusy(false) }
  }

  return (
    <>
      <button className="btn btn-text" style={{ alignSelf: 'flex-start' }} onClick={() => nav('/debt')}>{t('common.back')}</button>
      <h1 className="h1">{t('add.title')}</h1>
      <div className="joined">
        <div className="row" role="button" tabIndex={0} onClick={() => file.current?.click()}>
          <Icon name="upload" size={28} /><div className="grow"><div>{t('add.upload')}</div><div className="muted small">{t('add.uploadHint')}</div></div>
        </div>
        <div className="row" role="button" tabIndex={0} onClick={() => nav('/')}>
          <Icon name="mic" size={28} /><div className="grow">{t('add.talk')}</div>
        </div>
        <div className="row" role="button" tabIndex={0} onClick={() => setForm(true)}>
          <Icon name="edit" size={28} /><div className="grow">{t('add.form')}</div>
        </div>
      </div>
      <input ref={file} type="file" accept="image/*,application/pdf" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {busy && <p role="status">{t('common.loading')}</p>}
      {error && <p className="err" role="alert">{t('common.error')}</p>}
      {form && (
        <Sheet onClose={() => setForm(false)}>
          <DebtForm onCancel={() => setForm(false)} onSave={async (d) => { await store!.saveDebt(d); await refresh(); nav('/debt') }} />
        </Sheet>
      )}
    </>
  )
}
```
`../lib/ai` is written in Task 12. To keep the build green now, create a stub `src/lib/ai.ts`:
```ts
export async function extractDocument(_file: File): Promise<never[]> {
  throw new Error('extractDocument is implemented in Task 12')
}
```

- [ ] **Step 8: Wire routes in `src/App.tsx`** (inside the Shell route)

```tsx
import Debt from './screens/Debt'
import DebtGroup from './screens/DebtGroup'
import LoanDetail from './screens/LoanDetail'
import AddDebt from './screens/AddDebt'
// ...
<Route path="debt" element={<Debt />} />
<Route path="debt/add" element={<AddDebt />} />
<Route path="debt/group/:by/:key" element={<DebtGroup />} />
<Route path="debt/loan/:id" element={<LoanDetail />} />
```

- [ ] **Step 9: Verify and commit**

Run: `npm test` then `npm run typecheck` then `npm run build`
Expected: all succeed. Manual check (tell the user): add a debt by the form, see it grouped by bank and by type, open the loan, edit it, delete it.

```bash
git add -A
git commit -m "feat(debt): debt overview by bank and type, loan detail and manual entry"
```

---

Part 2A ends here. Continue with `2026-10-15-debtwise-part2b-ai-and-finish.md` starting at Task 12.
