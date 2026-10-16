import { expect, test } from 'vitest'
import { lockedPct, mapCoins } from './market'

test('mapCoins keeps known coins with a price and drops the rest', () => {
  const rows = [
    { id: 'arbitrum', symbol: 'arb', name: 'Arbitrum', current_price: 6.02, price_change_percentage_24h: -0.8, circulating_supply: 4e9, total_supply: 1e10, market_cap: 2.4e10, sparkline_in_7d: { price: Array.from({ length: 168 }, (_, i) => i) } },
    { id: 'unknown-coin', symbol: 'x', name: 'X', current_price: 1 },
    { id: 'sui', symbol: 'sui', name: 'Sui', current_price: null },
    'junk',
  ]
  const out = mapCoins(rows)
  expect(out).toHaveLength(1)
  expect(out[0]).toMatchObject({ id: 'arbitrum', symbol: 'ARB', priceThb: 6.02, change24h: -0.8 })
  expect(out[0].spark).toHaveLength(28)
  expect(mapCoins({ not: 'an array' })).toEqual([])
})
test('lockedPct is the share not in circulation and null when unknown', () => {
  expect(lockedPct({ circulating: 4e9, total: 1e10 })).toBe(60)
  expect(lockedPct({ circulating: 1e10, total: 1e10 })).toBe(0)
  expect(lockedPct({ circulating: null, total: 1e10 })).toBeNull()
  expect(lockedPct({ circulating: 5, total: null })).toBeNull()
})
