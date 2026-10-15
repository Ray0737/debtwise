import type { Coin } from '../../api/_lib/market'

export type { Coin }
export interface MarketData { updatedAt: string; coins: Coin[] }

export async function fetchMarket(): Promise<MarketData> {
  const r = await fetch('/api/market')
  if (!r.ok) throw new Error(`market ${r.status}`)
  return (await r.json()) as MarketData
}
