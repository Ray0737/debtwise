import type { VercelRequest, VercelResponse } from '@vercel/node'
import { findUnknownFigures } from '../src/engine/guard'
import { mask } from '../src/engine/mask'
import { requireUser } from './_lib/auth'
import { EXTRACT_SYSTEM, collectNumbers, consultSystem, parseCandidates, parseConsult, sanitizeFacts } from './_lib/prompts'
import { pickProvider } from './_lib/providers'

const MAX_INLINE = 4_000_000

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })
  const user = await requireUser(req)
  if (!user) return res.status(401).json({ error: 'auth' })
  if (overLimit(user)) return res.status(429).json({ error: 'rate' })
  const b = (req.body ?? {}) as Record<string, any>
  const lang = b.lang === 'en' ? 'en' : 'th'
  const provider = pickProvider(b.provider)
  try {
    if (b.action === 'extract') {
      const inline = b.inline as { mimeType?: string; data?: string } | undefined
      const text = typeof b.text === 'string' ? mask(b.text.slice(0, 20000)) : ''
      if (!text && !(inline?.data && inline.mimeType)) return res.status(400).json({ error: 'input' })
      if (inline?.data && inline.data.length > MAX_INLINE) return res.status(413).json({ error: 'size' })
      const out = await provider.generate({
        system: EXTRACT_SYSTEM,
        messages: [{ role: 'user', text: text || 'Extract the debts from the attached document.' }],
        inline: inline?.data && inline.mimeType ? { mimeType: inline.mimeType, data: inline.data } : undefined,
      })
      return res.status(200).json({ candidates: parseCandidates(safeJson(out)) })
    }
    if (b.action === 'consult') {
      const names: string[] = Array.isArray(b.names) ? b.names.filter((n: unknown) => typeof n === 'string').slice(0, 5) : []
      const messages = (Array.isArray(b.messages) ? b.messages : []).slice(-20).map((m: any) => ({
        role: m?.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        text: mask(String(m?.text ?? '').slice(0, 2000), names),
      }))
      if (!messages.length) return res.status(400).json({ error: 'input' })
      const facts = sanitizeFacts(b.facts)
      const out = await provider.generate({ system: consultSystem(lang, facts), messages })
      const parsed = parseConsult(safeJson(out))
      // Figures the person typed themselves and the 1323 mental health hotline are not invented.
      const typed = messages.filter((m) => m.role === 'user').flatMap((m) => [...m.text.matchAll(/\d[\d,]*(?:\.\d+)?/g)].map((x) => parseFloat(x[0].replace(/,/g, ''))))
      const flagged = findUnknownFigures(parsed.reply, [...collectNumbers(facts), ...typed, 1323])
      return res.status(200).json({ ...parsed, flagged, maskedPayload: messages })
    }
    return res.status(400).json({ error: 'action' })
  } catch {
    return res.status(502).json({ error: 'upstream' })
  }
}

// ponytail: per instance memory, so the limit resets on cold starts and is per instance. Move to a Supabase table or Upstash if abuse shows up.
const hits = new Map<string, number[]>()
export function overLimit(user: string, now = Date.now(), max = 20): boolean {
  const recent = (hits.get(user) ?? []).filter((t) => now - t < 60_000)
  recent.push(now)
  hits.set(user, recent)
  return recent.length > max
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s) } catch { return null }
}
