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
