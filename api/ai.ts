import type { VercelRequest, VercelResponse } from '@vercel/node'
import { findUnknownFigures } from '../src/engine/guard.js'
import { mask } from '../src/engine/mask.js'
import { requireUser } from './_lib/auth.js'
import { EXTRACT_SYSTEM, PROGRAMME_NUMBERS, collectNumbers, consultSystem, parseCandidates, parseConsult } from './_lib/prompts.js'
import { pickProvider } from './_lib/providers.js'

const MAX_INLINE = 4_000_000

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' })
  if (!(await requireUser(req))) return res.status(401).json({ error: 'auth' })
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
      const out = await provider.generate({ system: consultSystem(lang, b.facts ?? {}), messages })
      const parsed = parseConsult(safeJson(out))
      // Figures the person typed themselves (a bill amount) and public programme figures are allowed in a reply.
      const typed = messages.filter((m) => m.role === 'user').flatMap((m) => (m.text.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((x) => parseFloat(x.replace(/,/g, ''))))
      const flagged = findUnknownFigures(parsed.reply, [...collectNumbers(b.facts), ...PROGRAMME_NUMBERS, ...typed])
      return res.status(200).json({ ...parsed, flagged, maskedPayload: messages })
    }
    return res.status(400).json({ error: 'action' })
  } catch {
    return res.status(502).json({ error: 'upstream' })
  }
}

function safeJson(s: string): unknown {
  try { return JSON.parse(s) } catch { return null }
}
