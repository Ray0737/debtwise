export interface CashflowInput {
  monthlyIncome: number
  otherIncome: number
  essentials: number
  taxSetAside: number
  minimums: number
}
export interface Cashflow {
  available: number
  leftAfterMinimums: number
  shortfall: number
}

const n = (x: number) => (Number.isFinite(x) ? x : 0)

export function cashflow(i: CashflowInput): Cashflow {
  const available = n(i.monthlyIncome) + n(i.otherIncome) - n(i.essentials) - n(i.taxSetAside)
  const leftAfterMinimums = available - n(i.minimums)
  return { available, leftAfterMinimums, shortfall: Math.max(0, -leftAfterMinimums) }
}
