import { create } from 'zustand'
import type { Debt, Lang } from '../engine'
import { supabase } from '../lib/supabase'
import { SupabaseStore } from './supabaseStore'
import type { DataStore, Profile } from './types'

export interface OneOff { label: string; amount: number }
// ponytail: one-off bills live in localStorage per user and month, so they stay on this device.
// Upgrade path: a `one_offs` table behind DataStore, same shape.
const monthKey = (userId: string) => `dw-oneoff:${userId}:${new Date().toISOString().slice(0, 7)}`
const readOneOffs = (userId: string): OneOff[] => {
  try { return JSON.parse(localStorage.getItem(monthKey(userId)) ?? '[]') as OneOff[] } catch { return [] }
}
export const oneOffTotal = (list: OneOff[]) => list.reduce((s, o) => s + o.amount, 0)

interface AppState {
  oneOffs: OneOff[]
  addOneOff: (o: OneOff) => void
  clearOneOffs: () => void
  ready: boolean
  userId: string | null
  profile: Profile | null
  debts: Debt[]
  store: DataStore | null
  lang: Lang
  init: () => Promise<void>
  refresh: () => Promise<void>
  setLang: (l: Lang) => void
  signOut: () => Promise<void>
}

const readLang = (): Lang => {
  try { return localStorage.getItem('dw-lang') === 'en' ? 'en' : 'th' } catch { return 'th' }
}

export const useApp = create<AppState>((set, get) => ({
  oneOffs: [], ready: false, userId: null, profile: null, debts: [], store: null, lang: readLang(),

  async init() {
    const apply = async (userId: string | null) => {
      if (!userId) { set({ userId: null, store: null, profile: null, debts: [], ready: true }); return }
      const store = new SupabaseStore(supabase, userId)
      set({ userId, store, oneOffs: readOneOffs(userId) })
      await get().refresh()
      set({ ready: true })
    }
    const { data } = await supabase.auth.getSession()
    await apply(data.session?.user.id ?? null)
    supabase.auth.onAuthStateChange((_e, session) => { void apply(session?.user.id ?? null) })
  },

  async refresh() {
    const { store } = get()
    if (!store) return
    const [profile, debts] = await Promise.all([store.getProfile(), store.listDebts()])
    set({ profile, debts, lang: profile?.lang ?? get().lang })
  },

  addOneOff(o) {
    const { userId, oneOffs } = get()
    if (!userId) return
    const next = [...oneOffs, o]
    try { localStorage.setItem(monthKey(userId), JSON.stringify(next)) } catch { /* storage may be blocked */ }
    set({ oneOffs: next })
  },

  clearOneOffs() {
    const { userId } = get()
    if (userId) { try { localStorage.removeItem(monthKey(userId)) } catch { /* storage may be blocked */ } }
    set({ oneOffs: [] })
  },

  setLang(lang) {
    try { localStorage.setItem('dw-lang', lang) } catch { /* storage may be blocked */ }
    document.documentElement.lang = lang
    set({ lang })
    const { store, profile } = get()
    if (store && profile) void store.saveProfile({ lang })
  },

  async signOut() {
    await supabase.auth.signOut()
    set({ userId: null, store: null, profile: null, debts: [] })
  },
}))
