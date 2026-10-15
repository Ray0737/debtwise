import type { Debt } from './types'

export interface Allocation {
  debtId: string
  amount: number
  reason: 'minimum' | 'partial_minimum' | 'extra' | 'unpaid'
}
export interface PlanResult {
  allocations: Allocation[]
  shortfall: number
  leftover: number
  available: number
}

const rate = (d: Debt) => d.ratePct ?? 0

export function buildPlan(debts: Debt[], available: number): PlanResult {
  const sorted = [...debts].sort((a, b) => rate(b) - rate(a))
  let pool = Math.max(0, Number.isFinite(available) ? available : 0)
  const paid = new Map<string, number>()
  let shortfall = 0

  for (const d of sorted) {
    const due = Math.min(d.minPayment, d.balance)
    const pay = Math.min(due, pool)
    paid.set(d.id, pay)
    pool -= pay
    shortfall += due - pay
  }
  for (const d of sorted) {
    const add = Math.min(d.balance - (paid.get(d.id) ?? 0), pool)
    paid.set(d.id, (paid.get(d.id) ?? 0) + add)
    pool -= add
  }

  const allocations: Allocation[] = sorted.map((d) => {
    const amount = paid.get(d.id) ?? 0
    const due = Math.min(d.minPayment, d.balance)
    let reason: Allocation['reason'] = 'minimum'
    if (amount === 0 && due > 0) reason = 'unpaid'
    else if (amount < due) reason = 'partial_minimum'
    else if (amount > due) reason = 'extra'
    return { debtId: d.id, amount, reason }
  })
  return { allocations, shortfall, leftover: pool, available }
}

export function payoffMonths(balance: number, ratePct: number, payment: number): number | null {
  if (payment <= 0 || balance <= 0) return null
  const r = ratePct / 1200
  if (r === 0) return Math.ceil(balance / payment)
  if (payment <= balance * r) return null
  return Math.ceil(-Math.log(1 - (r * balance) / payment) / Math.log(1 + r))
}
