export const COIN_IDS = ['arbitrum', 'optimism', 'aptos', 'sui', 'celestia', 'starknet']

export interface Coin {
  id: string
  symbol: string
  name: string
  priceThb: number
  change24h: number | null
  circulating: number | null
  total: number | null
  marketCapThb: number | null
  spark: number[]
}

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null)

// 7 day price line: CoinGecko sends hourly points (about 168). Keep every 6th, enough for a small chart.
const sparkline = (v: unknown): number[] => {
  const p = (v as { price?: unknown } | null)?.price
  return Array.isArray(p) ? p.filter((x): x is number => typeof x === 'number' && Number.isFinite(x)).filter((_, i) => i % 6 === 0) : []
}

// CoinGecko /coins/markets rows in, plain coin rows out. Rows without a price are dropped.
export function mapCoins(raw: unknown): Coin[] {
  if (!Array.isArray(raw)) return []
  const out: Coin[] = []
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue
    const o = r as Record<string, unknown>
    const price = num(o.current_price)
    if (typeof o.id !== 'string' || !COIN_IDS.includes(o.id) || price === null) continue
    out.push({
      id: o.id,
      symbol: String(o.symbol ?? '').toUpperCase().slice(0, 12),
      name: String(o.name ?? o.id).slice(0, 40),
      priceThb: price,
      change24h: typeof o.price_change_percentage_24h === 'number' && Number.isFinite(o.price_change_percentage_24h) ? o.price_change_percentage_24h : null,
      circulating: num(o.circulating_supply),
      total: num(o.total_supply) ?? num(o.max_supply),
      marketCapThb: num(o.market_cap),
      spark: sparkline(o.sparkline_in_7d),
    })
  }
  return out
}

// Share of the supply that is not in circulation yet (locked, vesting or unissued). Null when unknown.
export function lockedPct(c: Pick<Coin, 'circulating' | 'total'>): number | null {
  if (!c.total || c.circulating === null || c.total <= 0) return null
  return Math.min(100, Math.max(0, Math.round((1 - c.circulating / c.total) * 100)))
}
