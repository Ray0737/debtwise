import type { DebtType, Offer } from '../../engine'
import type { SampleLabel } from './taxRules'

export type SampleOffer = Offer & SampleLabel & { forTypes: DebtType[] }

// Placeholder offers. The lead replaces these with hand-curated figures from public bank pages,
// each with its own source URL and date, before the demo.
const base = { sourceLabel: 'sample', sourceUrl: '', asOf: '2026-10-15' }

export const OFFERS: SampleOffer[] = [
  { id: 'o1', bank: 'Sample Bank A', ratePct: 7.5, termMonths: 36, fee: 2000, penalty: 0, insuranceMonthly: 0, forTypes: ['personal', 'credit_card'], ...base },
  { id: 'o2', bank: 'Sample Bank B', ratePct: 5.2, termMonths: 48, fee: 3500, penalty: 0, insuranceMonthly: 150, forTypes: ['car'], ...base },
  { id: 'o3', bank: 'Sample Bank C', ratePct: 3.2, termMonths: 240, fee: 15000, penalty: 10000, insuranceMonthly: 400, forTypes: ['home'], ...base },
]
