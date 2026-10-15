import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireUser } from './_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!(await requireUser(req))) return res.status(401).end()
  const key = process.env.ELEVENLABS_API_KEY
  const b = (req.body ?? {}) as { audioBase64?: string; mimeType?: string; lang?: string }
  if (!key || !b.audioBase64 || b.audioBase64.length > 4_000_000) return res.status(400).json({ error: 'input' })
  try {
    const form = new FormData()
    form.append('model_id', 'scribe_v1')
    form.append('language_code', b.lang === 'en' ? 'eng' : 'tha')
    form.append('file', new Blob([Buffer.from(b.audioBase64, 'base64')], { type: b.mimeType || 'audio/webm' }), 'audio.webm')
    const r = await fetch('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': key }, body: form })
    if (!r.ok) return res.status(502).json({ error: 'upstream' })
    const j = (await r.json()) as { text?: string }
    return res.status(200).json({ text: j.text ?? '' })
  } catch {
    return res.status(502).json({ error: 'upstream' })
  }
}
