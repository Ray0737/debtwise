import { create } from 'zustand'
import type { Debt, Lang } from '../engine'
import { supabase } from '../lib/supabase'
import { SupabaseStore } from './supabaseStore'
import type { DataStore, Profile } from './types'

interface AppState {
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
  ready: false, userId: null, profile: null, debts: [], store: null, lang: readLang(),

  async init() {
    const apply = async (userId: string | null) => {
      if (!userId) { set({ userId: null, store: null, profile: null, debts: [], ready: true }); return }
      const store = new SupabaseStore(supabase, userId)
      set({ userId, store })
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
