import type { VercelRequest, VercelResponse } from '@vercel/node'
import { COIN_IDS, mapCoins } from './_lib/market.js'

// Public market data from CoinGecko, cached at the edge so the free rate limit is not hit by every visitor.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=thb&ids=${COIN_IDS.join(',')}&price_change_percentage=24h&sparkline=true`
    const r = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(8000) })
    if (!r.ok) return res.status(502).json({ error: 'upstream' })
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900')
    return res.status(200).json({ updatedAt: new Date().toISOString(), coins: mapCoins(await r.json()) })
  } catch {
    return res.status(502).json({ error: 'upstream' })
  }
}
