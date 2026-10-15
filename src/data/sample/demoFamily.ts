import type { Debt } from '../../engine'

export const DEMO_PROFILE = {
  displayName: 'Demo family',
  birthYear: 1988,
  householdSize: 4,
  incomeType: 'salary' as const,
  monthlyIncome: 52000,
  otherIncome: 0,
  payDay: 25,
  retireAge: 60,
  postRetireIncome: null as number | null,
  monthlyEssentials: 28000,
}

export const DEMO_DEBTS: Omit<Debt, 'id' | 'sourceId'>[] = [
  { lender: 'Sample Bank A', type: 'credit_card', label: 'Credit card', balance: 85000, ratePct: 16, minPayment: 2550, dueDay: 5, termMonthsLeft: null, status: 'user_stated' },
  { lender: 'Sample Bank B', type: 'personal', label: 'Personal loan', balance: 120000, ratePct: 25, minPayment: 5200, dueDay: 10, termMonthsLeft: 30, status: 'user_stated' },
  { lender: 'Sample Bank C', type: 'car', label: 'Car loan', balance: 380000, ratePct: 6.5, minPayment: 9800, dueDay: 15, termMonthsLeft: 48, status: 'user_stated' },
  { lender: 'Sample Bank D', type: 'home', label: 'Home loan', balance: 1950000, ratePct: 3.9, minPayment: 11800, dueDay: 1, termMonthsLeft: 240, status: 'user_stated' },
  { lender: 'Student Loan Fund', type: 'student', label: 'Student loan', balance: 60000, ratePct: 1, minPayment: 1000, dueDay: 20, termMonthsLeft: 60, status: 'user_stated' },
  { lender: 'Relative', type: 'informal', label: 'Family loan', balance: 30000, ratePct: null, minPayment: 2000, dueDay: null, termMonthsLeft: null, status: 'user_stated' },
]
