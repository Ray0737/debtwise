import type { Candidate } from '../../api/_lib/prompts'
import type { Lang } from '../engine'
import { fileToInline } from './image'
import { supabase } from './supabase'

export type { Candidate }
export interface ConsultResult {
  reply: string
  proposal: { field: 'monthlyEssentials'; value: number; note: string } | null
  flagged: string[]
  maskedPayload: unknown
}

export async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  return { authorization: `Bearer ${data.session?.access_token ?? ''}` }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(`${path} ${r.status}`)
  return r.json() as Promise<T>
}

export async function extractDocument(file: File, lang: Lang = 'th'): Promise<Candidate[]> {
  const inline = await fileToInline(file)
  const r = await post<{ candidates: Candidate[] }>('/api/ai', { action: 'extract', lang, inline })
  return r.candidates
}

export function consult(i: {
  messages: { role: 'user' | 'assistant'; text: string }[]
  facts: unknown
  names: string[]
  lang: Lang
}): Promise<ConsultResult> {
  return post<ConsultResult>('/api/ai', { action: 'consult', ...i })
}
