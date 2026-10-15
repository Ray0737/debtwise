import { expect, test } from 'vitest'
import type { Profile } from '../store/types'
import { loadDemo, removeDemo } from './demo'

function fakeStore(existing: Partial<Profile> | null = null) {
  const calls = { debts: [] as any[], sources: [] as any[], profile: [] as any[], removed: 0 }
  const store: any = {
    getProfile: async () => (existing as Profile | null),
    saveProfile: async (p: any) => { calls.profile.push(p); return p },
    saveSource: async (s: any) => { calls.sources.push(s); return { id: 'src1', ...s } },
    saveDebt: async (d: any) => { calls.debts.push(d); return d },
    deleteSampleData: async () => { calls.removed++ },
  }
  return { store, calls }
}

test('loadDemo creates one sample source and six debts that point to it', async () => {
  const { store, calls } = fakeStore()
  await loadDemo(store)
  expect(calls.sources).toEqual([{ kind: 'sample' }])
  expect(calls.debts).toHaveLength(6)
  expect(calls.debts.every((d) => d.sourceId === 'src1')).toBe(true)
})
test('loadDemo fills the profile only when the user is not onboarded yet', async () => {
  const a = fakeStore(null)
  await loadDemo(a.store)
  expect(a.calls.profile).toHaveLength(1)
  expect(a.calls.profile[0].onboardedAt).toBeTruthy()
  const b = fakeStore({ onboardedAt: '2026-10-01T00:00:00Z', monthlyIncome: 99 })
  await loadDemo(b.store)
  expect(b.calls.profile).toHaveLength(0)
})
test('removeDemo deletes only sample data', async () => {
  const { store, calls } = fakeStore()
  await removeDemo(store)
  expect(calls.removed).toBe(1)
})
