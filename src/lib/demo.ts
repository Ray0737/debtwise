import { DEMO_DEBTS, DEMO_PROFILE } from '../data/sample/demoFamily'
import type { DataStore } from '../store/types'

export async function loadDemo(store: DataStore): Promise<void> {
  const existing = await store.getProfile()
  if (!existing?.onboardedAt) {
    await store.saveProfile({ ...DEMO_PROFILE, onboardedAt: new Date().toISOString() })
  }
  const source = await store.saveSource({ kind: 'sample' })
  for (const d of DEMO_DEBTS) await store.saveDebt({ ...d, sourceId: source.id })
}

export async function removeDemo(store: DataStore): Promise<void> {
  await store.deleteSampleData()
}
