import type { Debt, DebtType } from '../engine'

export interface Group {
  key: string
  total: number
  monthly: number
  byType: Partial<Record<DebtType, number>>
  debts: Debt[]
}

export const TYPE_COLOR: Record<DebtType, string> = {
  credit_card: 'var(--warn)',
  personal: 'var(--accent)',
  car: 'var(--card-dark)',
  home: 'var(--text)',
  student: 'var(--chart-5)',
  informal: 'var(--chart-5)',
}

export const TYPE_ICON: Record<DebtType, string> = {
  credit_card: 'card',
  personal: 'coins',
  car: 'car',
  home: 'house',
  student: 'book',
  informal: 'people',
}

export function groupDebts(debts: Debt[], by: 'bank' | 'type'): Group[] {
  const map = new Map<string, Group>()
  for (const d of debts) {
    const key = by === 'bank' ? d.lender : d.type
    const g = map.get(key) ?? { key, total: 0, monthly: 0, byType: {}, debts: [] }
    g.total += d.balance
    g.monthly += d.minPayment
    g.byType[d.type] = (g.byType[d.type] ?? 0) + d.balance
    g.debts.push(d)
    map.set(key, g)
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}
