import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useT, type Key } from '../i18n'
import { useApp } from '../store/useApp'
import { Icon } from './Icon'

const TABS: { to: string; icon: string; label: Key }[] = [
  { to: '/', icon: 'home', label: 'nav.home' },
  { to: '/invest', icon: 'chart', label: 'nav.invest' },
  { to: '/tax', icon: 'doc', label: 'nav.tax' },
  { to: '/debt', icon: 'wallet', label: 'nav.debt' },
]

const TITLES: [string, Key][] = [
  ['/invest', 'nav.invest'], ['/tax', 'nav.tax'], ['/debt', 'nav.debt'], ['/plan', 'plan.title'], ['/profile', 'profile.title'],
]

export function Shell() {
  const t = useT()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const { profile, lang, setLang } = useApp()
  const name = profile?.displayName ?? ''
  const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? 'nav.home'
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <button className="avatar" aria-label={t('profile.title')} onClick={() => nav('/profile')}>
            {name ? name.slice(0, 1) : <Icon name="person" size={16} />}
          </button>
          <span className="username">{name || t('app.name')}</span>
        </div>
        <div className="topbar-center"><span className="page-title">{t(title)}</span></div>
        <div className="topbar-right">
          <button className="icon-btn" aria-label={t('profile.language')} aria-pressed={lang === 'en'} onClick={() => setLang(lang === 'th' ? 'en' : 'th')}>
            <Icon name="globe" size={20} />
          </button>
          <button className="icon-btn" aria-label={t('profile.title')} onClick={() => nav('/profile')}>
            <Icon name="settings" size={20} />
          </button>
        </div>
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
