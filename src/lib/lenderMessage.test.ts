import { expect, test } from 'vitest'
import type { Debt } from '../engine'
import { buildLenderMessage } from './lenderMessage'

const debt: Debt = { id: '1', lender: 'SCB', type: 'personal', label: 'Personal loan', balance: 120000, ratePct: 25, minPayment: 5200, dueDay: 10, termMonthsLeft: 30, status: 'user_stated', sourceId: null }
const base = { debt, name: 'Ray', available: 22008, minimums: 32350, shortfall: 10342 }

test('the message carries the person numbers and names the lender', () => {
  const m = buildLenderMessage({ lang: 'en', ...base })
  for (const x of ['SCB', 'Ray', '120,000', '5,200', '22,008', '32,350', '10,342', 'day 10']) expect(m).toContain(x)
})
test('the Thai message has the same numbers and asks for a restructure', () => {
  const m = buildLenderMessage({ lang: 'th', ...base })
  for (const x of ['SCB', 'Ray', '120,000', '10,342', 'ปรับโครงสร้างหนี้']) expect(m).toContain(x)
})
test('a missing name leaves a placeholder instead of an empty signature', () => {
  expect(buildLenderMessage({ lang: 'en', ...base, name: ' ' })).toContain('[my name]')
})
