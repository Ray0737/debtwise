import type { VercelRequest } from '@vercel/node'

export async function requireUser(req: VercelRequest): Promise<string | null> {
  const header = req.headers.authorization ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token || !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) return null
  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY },
  })
  if (!r.ok) return null
  const u = (await r.json()) as { id?: string }
  return u.id ?? null
}
