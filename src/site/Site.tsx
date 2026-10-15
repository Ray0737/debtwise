import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../store/useApp'
import { Icon, Page } from '../ui'

export type B = { th: string; en: string }
export const useL = () => {
  const lang = useApp((s) => s.lang)
  return (b: B) => b[lang]
}

// Icon-only bottom nav shared by every page before login.
export function PublicDock() {
  const L = useL()
  const { pathname } = useLocation()
  const userId = useApp((s) => s.userId)
  const items: { to: string; icon: string; label: B }[] = [
    { to: '/', icon: 'house', label: { th: 'หน้าแรก', en: 'Home' } },
    { to: '/guide', icon: 'book', label: { th: 'คู่มือ', en: 'Guide' } },
    { to: '/start', icon: 'rocket-takeoff', label: { th: 'เริ่มต้นใช้งาน', en: 'Get started' } },
    { to: '/support', icon: 'chat-dots', label: { th: 'ช่วยเหลือ', en: 'Support' } },
    { to: '/community', icon: 'people', label: { th: 'ชุมชน', en: 'Community' } },
    { to: userId ? '/' : '/signin', icon: userId ? 'grid' : 'box-arrow-in-right', label: userId ? { th: 'เปิดแอป', en: 'Open app' } : { th: 'เข้าสู่ระบบ', en: 'Sign in' } },
  ]
  return (
    <nav className="tabs always" aria-label="Site">
      {items.map((i, n) => (
        <Link key={i.to + n} to={i.to} className={pathname === i.to && n < 5 ? 'active' : ''} aria-label={L(i.label)} title={L(i.label)} aria-current={pathname === i.to && n < 5 ? 'page' : undefined}>
          <Icon n={i.icon} />
        </Link>
      ))}
    </nav>
  )
}

export function LegalLinks() {
  const L = useL()
  return (
    <footer className="legal">
      <div className="wrap">
        <Link to="/install">{L({ th: 'ใช้งานแอป', en: 'Get the app' })}</Link>
        <Link to="/terms">{L({ th: 'ข้อกำหนด', en: 'Terms' })}</Link>
        <Link to="/privacy">{L({ th: 'ความเป็นส่วนตัว', en: 'Privacy' })}</Link>
      </div>
      <p className="small muted">© 2026 Debtwise · {L({ th: 'ต้นแบบ 0.1.0 · U-Hackathon ธีม 1 AI', en: 'Prototype 0.1.0 · U-Hackathon, Track 1 AI' })}</p>
    </footer>
  )
}

// A public page looks like the sign in page: navy header with the page title, white rounded sheet, icon dock below.
export function PublicPage({ title, sub, back = true, hero, children }: { title: B; sub?: B; back?: boolean; hero?: ReactNode; children: ReactNode }) {
  const L = useL()
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return (
    <main className="main pub half">
      <Page title="Debtwise" back={back ? '/' : undefined} hero={<><span className="big">{L(title)}</span>{sub && <span className="small">{L(sub)}</span>}{hero}</>}>
        {children}
        <LegalLinks />
      </Page>
      <PublicDock />
    </main>
  )
}
