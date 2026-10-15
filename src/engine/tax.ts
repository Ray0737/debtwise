export const SAMPLE_TAX_YEAR = 2569
export const TAX_RULES_LABEL = 'sample'

export interface TaxEstimate {
  taxableIncome: number
  tax: number
  marginalRate: number
  assumptions: string[]
}

// Sample progressive bands. Verify against the Revenue Department before showing as fact.
const BANDS: { upTo: number; rate: number }[] = [
  { upTo: 150000, rate: 0 },
  { upTo: 300000, rate: 0.05 },
  { upTo: 500000, rate: 0.1 },
  { upTo: 750000, rate: 0.15 },
  { upTo: 1000000, rate: 0.2 },
  { upTo: 2000000, rate: 0.25 },
  { upTo: 5000000, rate: 0.3 },
  { upTo: Infinity, rate: 0.35 },
]
const PERSONAL_ALLOWANCE = 60000
const EXPENSE_CAP = 100000

export function estimateTax(i: { annualIncome: number; kind: 'salary' | 'freelance'; allowances: number }): TaxEstimate {
  const income = Number.isFinite(i.annualIncome) ? Math.max(0, i.annualIncome) : 0
  const extra = Number.isFinite(i.allowances) ? Math.max(0, i.allowances) : 0
  const expenses = Math.min(income * 0.5, EXPENSE_CAP)
  const taxableIncome = Math.max(0, income - expenses - PERSONAL_ALLOWANCE - extra)

  let tax = 0
  let lower = 0
  let marginalRate = 0
  for (const b of BANDS) {
    if (taxableIncome > lower) {
      tax += (Math.min(taxableIncome, b.upTo) - lower) * b.rate
      marginalRate = b.rate
    }
    lower = b.upTo
  }
  const assumptions = [
    `Sample rules for tax year ${SAMPLE_TAX_YEAR}, not verified.`,
    'Standard expense deduction of 50% of income, capped at 100,000.',
    'Personal allowance of 60,000.',
  ]
  if (i.kind === 'freelance') assumptions.push('Freelance income may use different expense rules. Check the income category.')
  return { taxableIncome, tax: Math.round(tax), marginalRate, assumptions }
}
