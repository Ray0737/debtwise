import { useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useT } from './i18n'
import type { Key } from './i18n'
import Add from './screens/Add'
import Debt from './screens/Debt'
import Group from './screens/Group'
import Home from './screens/Home'
import Invest from './screens/Invest'
import Loan from './screens/Loan'
import Onboarding from './screens/Onboarding'
import Plan from './screens/Plan'
import Profile from './screens/Profile'
import Review from './screens/Review'
import SignIn from './screens/SignIn'
import Tax from './screens/Tax'
import { Community, Guide, Install, Landing, Privacy, Start, Support, Terms } from './site/pages'
import { bankColor } from './lib/bank'
import { groupDebts } from './lib/group'
import { supabase } from './lib/supabase'
import { useApp } from './store/useApp'
import { Icon } from './ui'

const NAV: { to: string; icon: string; key: Key }[] = [
  { to: '/', icon: 'house', key: 'nav.home' },
  { to: '/invest', icon: 'graph-up-arrow', key: 'nav.invest' },
  { to: '/tax', icon: 'receipt', key: 'nav.tax' },
  { to: '/debt', icon: 'credit-card-2-front', key: 'nav.debt' },
  { to: '/profile', icon: 'person', key: 'nav.profile' },
]

const compact = (n: number) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

function Shell() {
  const t = useT()
  const { lang, setLang, profile, debts, signOut } = useApp()
  const nav = useNavigate()
  const [account, setAccount] = useState({ email: '', photo: '' })
  const [open, setOpen] = useState({ debts: true, shortcuts: false })
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      const u = data.user
      const m = (u?.user_metadata ?? {}) as { avatar_url?: string; picture?: string }
      setAccount({ email: u?.email ?? '', photo: m.avatar_url ?? m.picture ?? '' })
    })
  }, [])
  const links = NAV.map((n) => (
    <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
      <Icon n={n.icon} /><span className="grow">{t(n.key)}</span>
      {n.to === '/debt' && debts.length > 0 && <span className="count">{debts.length}</span>}
    </NavLink>
  ))
  const name = profile?.displayName || t('app.name')
  const groups = groupDebts(debts, 'bank')
  const fold = (k: 'debts' | 'shortcuts', title: string, children: ReactNode) => (
    <div className="side-card side-fold">
      <button className="fold-head" aria-expanded={open[k]} onClick={() => setOpen({ ...open, [k]: !open[k] })}>
        <span className="grow">{title}</span><Icon n={open[k] ? 'chevron-up' : 'chevron-down'} />
      </button>
      {open[k] && <div className="fold-body">{children}</div>}
    </div>
  )
  return (
    <div className="shell">
      <aside className="side">
        <div className="side-card side-me">
          <Link className="side-user" to="/profile">
            <span className="avatar">{account.photo ? <img src={account.photo} alt="" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none' }} /> : null}<b>{name.trim().charAt(0).toUpperCase()}</b></span>
            <span className="grow"><span className="ell name">{name}</span><span className="ell small">{account.email || t('profile.title')}</span></span>
          </Link>
          <button className="side-ico" aria-label="Language" title={lang === 'th' ? 'English' : 'ภาษาไทย'} onClick={() => setLang(lang === 'th' ? 'en' : 'th')}>{lang === 'th' ? 'EN' : 'TH'}</button>
          <button className="side-ico" aria-label={t('profile.signOut')} title={t('profile.signOut')} onClick={async () => { await signOut(); nav('/signin') }}><Icon n="box-arrow-right" /></button>
        </div>
        <div className="side-scroll">
          <nav className="side-card side-nav" aria-label="Main">{links}</nav>
          {groups.length > 0 && fold('debts', t('debt.byBank'), groups.map((g) => (
            <Link key={g.key} to={`/debt/group/bank/${encodeURIComponent(g.key)}`} className="fold-item">
              <span className="dot" style={{ background: bankColor(g.key)?.background ?? 'rgba(255,255,255,0.55)' }} />
              <span className="grow ell">{g.key}</span><span className="count">{compact(g.total)}</span>
            </Link>
          )))}
          {fold('shortcuts', t('nav.shortcuts'), <>
            <Link to="/plan" className="fold-item"><Icon n="list-check" /><span className="grow">{t('home.openPlan')}</span></Link>
            <Link to="/debt/add" className="fold-item"><Icon n="plus-lg" /><span className="grow">{t('debt.add')}</span></Link>
          </>)}
        </div>
      </aside>
      <main className="main"><Outlet /></main>
      <nav className="tabs" aria-label="Main">{NAV.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')} aria-label={t(n.key)} title={t(n.key)}><Icon n={n.icon} /></NavLink>
      ))}</nav>
    </div>
  )
}

function Gate() {
  const { ready, userId, profile } = useApp()
  const t = useT()
  const { pathname } = useLocation()
  if (!ready) return <div className="center">{t('common.loading')}</div>
  if (!userId) return pathname === '/' ? <Landing /> : <Navigate to="/signin" replace />
  if (!profile?.onboardedAt) return <Navigate to="/onboarding/1" replace />
  return <Shell />
}

export default function App() {
  const init = useApp((s) => s.init)
  const lang = useApp((s) => s.lang)
  useEffect(() => { void init() }, [init])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="signin" element={<SignIn />} />
        <Route path="guide" element={<Guide />} />
        <Route path="install" element={<Install />} />
        <Route path="start" element={<Start />} />
        <Route path="support" element={<Support />} />
        <Route path="community" element={<Community />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="onboarding/:step" element={<Onboarding />} />
        <Route element={<Gate />}>
          <Route index element={<Home />} />
          <Route path="invest" element={<Invest />} />
          <Route path="tax" element={<Tax />} />
          <Route path="debt" element={<Debt />} />
          <Route path="debt/add" element={<Add />} />
          <Route path="debt/review" element={<Review />} />
          <Route path="debt/group/:by/:key" element={<Group />} />
          <Route path="debt/loan/:id" element={<Loan />} />
          <Route path="plan" element={<Plan />} />
          <Route path="profile" element={<Profile />} />
          <Route path="talk" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
