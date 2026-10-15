import type { SampleLabel } from './taxRules'

export interface TokenEvent extends SampleLabel {
  id: string
  token: string
  kind: 'unlock' | 'vesting' | 'emission'
  date: string
  amountTokens: number
  shareOfSupplyPct: number
}

// Fictional tokens and numbers. Replace with Tokenomist data once API access and terms are confirmed.
const base: SampleLabel = { sourceLabel: 'sample', sourceUrl: 'https://enterprise.tokenomist.ai/', asOf: '2026-10-15' }

export const TOKEN_EVENTS: TokenEvent[] = [
  { id: 't1', token: 'TOKA', kind: 'unlock', date: '2026-10-20', amountTokens: 12000000, shareOfSupplyPct: 1.2, ...base },
  { id: 't2', token: 'TOKB', kind: 'vesting', date: '2026-10-28', amountTokens: 4500000, shareOfSupplyPct: 0.45, ...base },
  { id: 't3', token: 'TOKA', kind: 'emission', date: '2026-11-01', amountTokens: 2000000, shareOfSupplyPct: 0.2, ...base },
  { id: 't4', token: 'TOKC', kind: 'unlock', date: '2026-11-12', amountTokens: 30000000, shareOfSupplyPct: 3.0, ...base },
]
export const WATCHLIST = ['TOKA', 'TOKB']
