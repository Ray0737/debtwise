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
