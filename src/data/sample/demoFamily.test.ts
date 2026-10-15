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
