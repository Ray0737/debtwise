import type { VercelRequest, VercelResponse } from '@vercel/node'
import { requireUser } from './_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!(await requireUser(req))) return res.status(401).end()
  const key = process.env.ELEVENLABS_API_KEY
  const voice = process.env.ELEVENLABS_VOICE_ID
  const text = String((req.body ?? {}).text ?? '').slice(0, 800)
  if (!key || !voice || !text) return res.status(400).end()
  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
    })
    if (!r.ok) return res.status(502).end()
    res.setHeader('Content-Type', 'audio/mpeg')
    return res.status(200).send(Buffer.from(await r.arrayBuffer()))
  } catch {
    return res.status(502).end()
  }
}
