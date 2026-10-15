import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useT, type Key } from '../i18n'
import { useApp } from '../store/useApp'
import { Icon } from './Icon'

const TABS: { to: string; icon: string; label: Key }[] = [
  { to: '/', icon: 'home', label: 'nav.home' },
  { to: '/invest', icon: 'chart', label: 'nav.invest' },
  { to: '/tax', icon: 'doc', label: 'nav.tax' },
  { to: '/debt', icon: 'wallet', label: 'nav.debt' },
]

export function Shell() {
  const t = useT()
  const nav = useNavigate()
  const name = useApp((s) => s.profile?.displayName) ?? ''
  return (
    <div className="app">
      <header className="topbar">
        <span className="brand"><span className="brand-mark"><Icon name="check" size={16} /></span>{t('app.name')}</span>
        <button className="avatar" aria-label={t('profile.title')} onClick={() => nav('/profile')}>
          {name ? name.slice(0, 1) : <Icon name="person" size={16} />}
        </button>
      </header>
      <main className="main"><Outlet /></main>
      <nav className="tabbar" aria-label="Main">
        {TABS.map((x) => (
          <NavLink key={x.to} to={x.to} end={x.to === '/'} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            <Icon name={x.icon} size={22} />
            <span>{t(x.label)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
