import type { SupabaseClient } from '@supabase/supabase-js'
import type { Debt } from '../engine'
import type { DataStore, DebtInput, Message, Profile, Source, SourceInput } from './types'

const num = (v: unknown): number | null => (v === null || v === undefined || v === '' ? null : Number(v))

export function debtFromRow(r: any): Debt {
  return {
    id: r.id, lender: r.lender, type: r.type, label: r.label,
    balance: Number(r.balance), ratePct: num(r.rate_pct), minPayment: Number(r.min_payment),
    dueDay: r.due_day ?? null, termMonthsLeft: r.term_months_left ?? null,
    status: r.status, sourceId: r.source_id ?? null,
  }
}

export function debtToRow(d: Partial<DebtInput>): Record<string, unknown> {
  const map: Record<string, string> = {
    lender: 'lender', type: 'type', label: 'label', balance: 'balance', ratePct: 'rate_pct',
    minPayment: 'min_payment', dueDay: 'due_day', termMonthsLeft: 'term_months_left',
    status: 'status', sourceId: 'source_id',
  }
  const out: Record<string, unknown> = {}
  for (const [k, col] of Object.entries(map)) if (k in d) out[col] = (d as any)[k]
  return out
}

const PROFILE_MAP: Record<string, string> = {
  displayName: 'display_name', birthYear: 'birth_year', householdSize: 'household_size',
  incomeType: 'income_type', monthlyIncome: 'monthly_income', otherIncome: 'other_income',
  payDay: 'pay_day', retireAge: 'retire_age', postRetireIncome: 'post_retire_income',
  monthlyEssentials: 'monthly_essentials', lang: 'lang', onboardedAt: 'onboarded_at',
}

export function profileToRow(p: Partial<Profile>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, col] of Object.entries(PROFILE_MAP)) if (k in p) out[col] = (p as any)[k]
  return out
}

export function profileFromRow(r: any): Profile {
  return {
    displayName: r.display_name ?? '', birthYear: r.birth_year ?? null, householdSize: r.household_size ?? null,
    incomeType: r.income_type ?? null, monthlyIncome: num(r.monthly_income), otherIncome: num(r.other_income) ?? 0,
    payDay: r.pay_day ?? null, retireAge: r.retire_age ?? null, postRetireIncome: num(r.post_retire_income),
    monthlyEssentials: num(r.monthly_essentials), lang: r.lang === 'en' ? 'en' : 'th', onboardedAt: r.onboarded_at ?? null,
  }
}

function fail(e: { message: string } | null): void {
  if (e) throw new Error(e.message)
}

function sourceFromRow(r: any): Source {
  return {
    id: r.id, kind: r.kind, fileName: r.file_name ?? undefined, page: r.page ?? undefined,
    lineText: r.line_text ?? undefined, confidence: r.confidence ?? undefined,
  }
}

export class SupabaseStore implements DataStore {
  constructor(private db: SupabaseClient, private userId: string) {}

  async getProfile() {
    const { data, error } = await this.db.from('profiles').select('*').eq('user_id', this.userId).maybeSingle()
    fail(error)
    return data ? profileFromRow(data) : null
  }
  async saveProfile(p: Partial<Profile>) {
    const { data, error } = await this.db
      .from('profiles').upsert({ user_id: this.userId, ...profileToRow(p) }, { onConflict: 'user_id' }).select('*').single()
    fail(error)
    return profileFromRow(data)
  }
  async listDebts() {
    const { data, error } = await this.db.from('debts').select('*').eq('user_id', this.userId).order('created_at')
    fail(error)
    return (data ?? []).map(debtFromRow)
  }
  async saveDebt(d: DebtInput & { id?: string }) {
    const row = { ...debtToRow(d), user_id: this.userId, updated_at: new Date().toISOString() }
    const q = d.id
      ? this.db.from('debts').update(row).eq('id', d.id).eq('user_id', this.userId)
      : this.db.from('debts').insert(row)
    const { data, error } = await q.select('*').single()
    fail(error)
    return debtFromRow(data)
  }
  async deleteDebt(id: string) {
    const { error } = await this.db.from('debts').delete().eq('id', id).eq('user_id', this.userId)
    fail(error)
  }
  async saveSource(s: SourceInput): Promise<Source> {
    const { data, error } = await this.db.from('sources').insert({
      user_id: this.userId, kind: s.kind, file_name: s.fileName ?? null, page: s.page ?? null,
      line_text: s.lineText ?? null, confidence: s.confidence ?? null,
    }).select('*').single()
    fail(error)
    return sourceFromRow(data)
  }
  async getSources(ids: string[]) {
    if (!ids.length) return []
    const { data, error } = await this.db.from('sources').select('*').in('id', ids)
    fail(error)
    return (data ?? []).map(sourceFromRow)
  }
  async listMessages(limit = 50) {
    const { data, error } = await this.db.from('messages').select('*').eq('user_id', this.userId).order('created_at', { ascending: false }).limit(limit)
    fail(error)
    return (data ?? []).reverse().map((r: any): Message => ({ id: r.id, role: r.role, content: r.content, maskedPayload: r.masked_payload ?? undefined, createdAt: r.created_at }))
  }
  async addMessage(m: Omit<Message, 'id' | 'createdAt'>) {
    const { data, error } = await this.db.from('messages').insert({
      user_id: this.userId, role: m.role, content: m.content, masked_payload: m.maskedPayload ?? null,
    }).select('*').single()
    fail(error)
    return { id: data.id, role: data.role, content: data.content, maskedPayload: data.masked_payload ?? undefined, createdAt: data.created_at } as Message
  }
  async savePlan(month: string, inputs: unknown, result: unknown) {
    const { error } = await this.db.from('plans').insert({ user_id: this.userId, month, inputs, result })
    fail(error)
  }
  async hasPlan(month: string) {
    const { data, error } = await this.db.from('plans').select('id').eq('user_id', this.userId).eq('month', month).limit(1)
    fail(error)
    return (data ?? []).length > 0
  }
  async deleteSampleData() {
    const { data, error } = await this.db.from('sources').select('id').eq('user_id', this.userId).eq('kind', 'sample')
    fail(error)
    const ids = (data ?? []).map((r: any) => r.id)
    if (!ids.length) return
    const d = await this.db.from('debts').delete().eq('user_id', this.userId).in('source_id', ids)
    fail(d.error)
    const s = await this.db.from('sources').delete().eq('user_id', this.userId).in('id', ids)
    fail(s.error)
  }
  async exportAll() {
    const out: Record<string, unknown> = {}
    for (const t of ['profiles', 'sources', 'debts', 'plans', 'messages']) {
      const { data, error } = await this.db.from(t).select('*').eq('user_id', this.userId)
      fail(error)
      out[t] = data
    }
    return out
  }
  async deleteAll() {
    for (const t of ['messages', 'plans', 'debts', 'sources', 'profiles']) {
      const { error } = await this.db.from(t).delete().eq('user_id', this.userId)
      fail(error)
    }
  }
}
