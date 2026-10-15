import type { Debt, Lang } from '../engine'

export interface Profile {
  displayName: string
  birthYear: number | null
  householdSize: number | null
  incomeType: 'salary' | 'freelance' | 'both' | null
  monthlyIncome: number | null
  otherIncome: number
  payDay: number | null
  retireAge: number | null
  postRetireIncome: number | null
  monthlyEssentials: number | null
  lang: Lang
  onboardedAt: string | null
}
export interface SourceInput {
  kind: 'upload' | 'voice' | 'form' | 'sample'
  fileName?: string
  page?: number
  lineText?: string
  confidence?: number
}
export interface Source extends SourceInput {
  id: string
}
export type DebtInput = Omit<Debt, 'id'>
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  maskedPayload?: unknown
  createdAt: string
}

export interface DataStore {
  getProfile(): Promise<Profile | null>
  saveProfile(p: Partial<Profile>): Promise<Profile>
  listDebts(): Promise<Debt[]>
  saveDebt(d: DebtInput & { id?: string }): Promise<Debt>
  deleteDebt(id: string): Promise<void>
  saveSource(s: SourceInput): Promise<Source>
  getSources(ids: string[]): Promise<Source[]>
  listMessages(limit?: number): Promise<Message[]>
  addMessage(m: Omit<Message, 'id' | 'createdAt'>): Promise<Message>
  savePlan(month: string, inputs: unknown, result: unknown): Promise<void>
  hasPlan(month: string): Promise<boolean>
  deleteSampleData(): Promise<void>
  exportAll(): Promise<unknown>
  deleteAll(): Promise<void>
}
