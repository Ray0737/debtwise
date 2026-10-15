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
