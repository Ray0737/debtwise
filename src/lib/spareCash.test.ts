import { expect, test } from 'vitest'
import { compareToDebt, monthlyInterest } from './spareCash'

const acc = (balance: number, ratePct: number) => ({ id: String(balance), name: 'a', balance, ratePct })

test('monthly interest is balance times yearly rate over twelve', () => expect(monthlyInterest(120000, 1.5)).toBeCloseTo(150))
test('compares the same amount against the costliest debt, capped by that debt balance', () => {
  const r = compareToDebt([acc(100000, 1.5)], [
    { lender: 'Cheap', balance: 500000, ratePct: 6 },
    { lender: 'Card', balance: 40000, ratePct: 18 },
    { lender: 'Unknown rate', balance: 9e6, ratePct: null },
  ])!
  expect(r.lender).toBe('Card')
  expect(r.amount).toBe(40000)
  expect(r.earns).toBeCloseTo(50)
  expect(r.costs).toBeCloseTo(600)
})
test('nothing to compare without savings or a rated debt', () => {
  expect(compareToDebt([], [{ lender: 'A', balance: 1, ratePct: 5 }])).toBeNull()
  expect(compareToDebt([acc(10, 1)], [{ lender: 'A', balance: 1, ratePct: null }])).toBeNull()
})
