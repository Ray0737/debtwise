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

test('allowances add up with caps: spouse, children, parents, insurance share one 100,000 cap', async () => {
  const { allowanceTotal } = await import('./deductions')
  expect(allowanceTotal({})).toBe(0)
  expect(allowanceTotal({ spouse: true })).toBe(60000)
  expect(allowanceTotal({ children: 2, laterChildren: 1 })).toBe(2 * 30000 + 30000)
  expect(allowanceTotal({ children: 1, laterChildren: 5 })).toBe(30000 + 30000)
  expect(allowanceTotal({ parents: 9 })).toBe(4 * 30000)
  expect(allowanceTotal({ lifeInsurance: 90000, healthInsurance: 25000 })).toBe(100000)
  expect(allowanceTotal({ socialSecurity: 99999 })).toBe(9000)
})
test('junk answers cannot create an allowance', async () => {
  const { allowanceTotal } = await import('./deductions')
  expect(allowanceTotal({ children: -3, parents: NaN, socialSecurity: -5, homeLoanInterest: Infinity, lifeInsurance: '9' as unknown as number })).toBe(0)
})
