import { buildPlan, cashflow, estimateTax, type Cashflow, type Debt, type PlanResult } from '../engine'
import type { Profile } from '../store/types'

export function annualIncome(p: Profile): number {
  return ((p.monthlyIncome ?? 0) + (p.otherIncome ?? 0)) * 12
}

export function monthlyTaxSetAside(p: Profile): number {
  const t = estimateTax({ annualIncome: annualIncome(p), kind: p.incomeType === 'freelance' ? 'freelance' : 'salary', allowances: 0 })
  return Math.round(t.tax / 12)
}

export function summarize(p: Profile, debts: Debt[]): {
  taxSetAside: number; minimums: number; cash: Cashflow; plan: PlanResult; essentialsMissing: boolean
} {
  const taxSetAside = monthlyTaxSetAside(p)
  const minimums = debts.reduce((s, d) => s + d.minPayment, 0)
  const cash = cashflow({
    monthlyIncome: p.monthlyIncome ?? 0, otherIncome: p.otherIncome ?? 0,
    essentials: p.monthlyEssentials ?? 0, taxSetAside, minimums,
  })
  return { taxSetAside, minimums, cash, plan: buildPlan(debts, cash.available), essentialsMissing: p.monthlyEssentials == null }
}

export function daysUntilDue(dueDay: number, today: Date = new Date()): number {
  const y = today.getUTCFullYear()
  const m = today.getUTCMonth()
  const lastOf = (yy: number, mm: number) => new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate()
  const todayMs = Date.UTC(y, m, today.getUTCDate())
  let target = Date.UTC(y, m, Math.min(dueDay, lastOf(y, m)))
  if (target < todayMs) target = Date.UTC(y, m + 1, Math.min(dueDay, lastOf(y, m + 1)))
  return Math.round((target - todayMs) / 86400000)
}
