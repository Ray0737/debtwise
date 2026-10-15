import type { DataStore } from '../store/types'

// Stub until Task 16 implements the demo family loader.
export async function loadDemo(_store: DataStore): Promise<void> {
  throw new Error('loadDemo is implemented in Task 16')
}

export async function removeDemo(store: DataStore): Promise<void> {
  await store.deleteSampleData()
}
