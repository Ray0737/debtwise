import { expect, test } from 'vitest'
import { DEMO_DEBTS, DEMO_PROFILE } from '../data/sample/demoFamily'
import type { Debt } from '../engine'
import type { Profile } from '../store/types'
import { annualIncome, daysUntilDue, monthlyTaxSetAside, summarize } from './derive'

const profile: Profile = { ...DEMO_PROFILE, lang: 'th', onboardedAt: null }
const debts: Debt[] = DEMO_DEBTS.map((d, i) => ({ ...d, id: String(i), sourceId: null }))

test('annual income is twelve months of both income streams', () => {
  expect(annualIncome(profile)).toBe(624000)
})
test('monthly tax set aside for the demo family is 1,992', () => {
  expect(monthlyTaxSetAside(profile)).toBe(1992)
})
test('summary for the demo family has a 10,342 shortfall', () => {
  const s = summarize(profile, debts)
  expect(s.minimums).toBe(32350)
  expect(s.cash.available).toBe(22008)
  expect(s.cash.shortfall).toBe(10342)
  expect(s.plan.shortfall).toBe(10342)
  expect(s.essentialsMissing).toBe(false)
})
test('missing incomes and essentials never produce NaN', () => {
  const p: Profile = { ...profile, monthlyIncome: null, monthlyEssentials: null, otherIncome: 0 }
  const s = summarize(p, debts)
  expect(Number.isNaN(s.cash.available)).toBe(false)
  expect(s.essentialsMissing).toBe(true)
})
test('days until due counts to the next occurrence', () => {
  const today = new Date(Date.UTC(2026, 9, 15))
  expect(daysUntilDue(20, today)).toBe(5)
  expect(daysUntilDue(15, today)).toBe(0)
  expect(daysUntilDue(10, today)).toBe(26)
})
test('days until due clamps to the end of a short month', () => {
  expect(daysUntilDue(31, new Date(Date.UTC(2026, 10, 5)))).toBe(25)
})

test('a one-off bill lowers what is available and grows the shortfall by the same amount', () => {
  const base = summarize(profile, debts)
  const tuition = summarize(profile, debts, 15000)
  expect(base.cash.available - tuition.cash.available).toBe(15000)
  expect(tuition.plan.shortfall).toBeGreaterThanOrEqual(base.plan.shortfall)
})
