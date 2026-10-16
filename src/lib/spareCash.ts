// Savings the person keeps outside Debtwise. Typed in by hand and kept in this browser only, since no bank feed exists.
export interface SpareAccount { id: string; name: string; balance: number; ratePct: number }

const KEY = 'dw-spare-cash'

export const loadSpare = (): SpareAccount[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((a) => a && typeof a.id === 'string' && Number.isFinite(a.balance) && Number.isFinite(a.ratePct)) : []
  } catch { return [] }
}
export const saveSpare = (a: SpareAccount[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(a)) } catch { /* private mode: kept until reload */ }
}

export const monthlyInterest = (amount: number, ratePct: number) => (amount * ratePct) / 100 / 12

// Same amount, two sides: what it earns in savings and what the costliest debt charges on it. Information only.
export function compareToDebt(accounts: SpareAccount[], debts: { lender: string; balance: number; ratePct: number | null }[]) {
  const costliest = debts.filter((d) => d.ratePct !== null && d.balance > 0).sort((a, b) => b.ratePct! - a.ratePct!)[0]
  const total = accounts.reduce((n, a) => n + a.balance, 0)
  if (!costliest || total <= 0) return null
  const amount = Math.min(total, costliest.balance)
  const earnPct = total > 0 ? accounts.reduce((n, a) => n + a.balance * a.ratePct, 0) / total : 0
  return {
    lender: costliest.lender, amount, earnPct, debtPct: costliest.ratePct!,
    earns: monthlyInterest(amount, earnPct), costs: monthlyInterest(amount, costliest.ratePct!),
  }
}
