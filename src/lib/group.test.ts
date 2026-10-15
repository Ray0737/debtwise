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
