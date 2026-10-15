import { expect, test } from 'vitest'
import { DEMO_DEBTS, DEMO_PROFILE } from '../data/sample/demoFamily'
import type { Debt } from '../engine'
import type { Profile } from '../store/types'
import { buildFacts } from './facts'

const profile: Profile = { ...DEMO_PROFILE, lang: 'th', onboardedAt: null }
const debts: Debt[] = DEMO_DEBTS.map((d, i) => ({ ...d, id: String(i), sourceId: null }))

test('facts carry the engine numbers and every debt', () => {
  const f = buildFacts(profile, debts)
  expect(f.shortfall).toBe(10342)
  expect(f.minimums).toBe(32350)
  expect(f.debts).toHaveLength(6)
})
test('every number in the facts is finite', () => {
  const nums: number[] = []
  const walk = (o: unknown) => {
    if (typeof o === 'number') nums.push(o)
    else if (Array.isArray(o)) o.forEach(walk)
    else if (o && typeof o === 'object') Object.values(o).forEach(walk)
  }
  walk(buildFacts(profile, debts))
  expect(nums.every(Number.isFinite)).toBe(true)
})
test('facts contain no names or ids', () => {
  const s = JSON.stringify(buildFacts({ ...profile, displayName: 'Somchai' }, debts))
  expect(s.includes('Somchai')).toBe(false)
})

test('facts tell the consultant about a one-off bill this month', () => {
  const f = buildFacts(profile, debts, 15000)
  expect(f.oneOffThisMonth).toBe(15000)
  expect(buildFacts(profile, debts).oneOffThisMonth).toBe(0)
})
