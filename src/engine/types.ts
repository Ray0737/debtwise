export type DebtType = 'credit_card' | 'personal' | 'car' | 'home' | 'student' | 'informal'
export type DebtStatus = 'verified' | 'needs_review' | 'user_stated'
export type Lang = 'th' | 'en'

export interface Debt {
  id: string
  lender: string
  type: DebtType
  label: string
  balance: number
  ratePct: number | null
  minPayment: number
  dueDay: number | null
  termMonthsLeft: number | null
  status: DebtStatus
  sourceId: string | null
}
