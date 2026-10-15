import type { Debt } from '../engine'
import type { Profile } from '../store/types'
import { summarize } from './derive'

export function buildFacts(p: Profile, debts: Debt[]) {
  const s = summarize(p, debts)
  const planned = new Map(s.plan.allocations.map((a) => [a.debtId, a.amount]))
  return {
    monthlyIncome: p.monthlyIncome ?? 0,
    otherIncome: p.otherIncome ?? 0,
    essentials: p.monthlyEssentials ?? 0,
    taxSetAside: s.taxSetAside,
    available: s.cash.available,
    minimums: s.minimums,
    shortfall: s.plan.shortfall,
    leftover: s.plan.leftover,
    debts: debts.map((d) => ({
      lender: d.lender, type: d.type, balance: d.balance, ratePct: d.ratePct,
      minPayment: d.minPayment, planned: planned.get(d.id) ?? 0,
    })),
  }
}
