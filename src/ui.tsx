import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { DebtStatus } from './engine'
import { useT } from './i18n'
import { useApp } from './store/useApp'

export const Icon = ({ n }: { n: string }) => <i className={`bi bi-${n}`} aria-hidden="true" />

export function LangButton() {
  const { lang, setLang } = useApp()
  return (
    <button className="langpill" aria-label={lang === 'th' ? 'English' : 'ภาษาไทย'} title={lang === 'th' ? 'English' : 'ภาษาไทย'} onClick={() => setLang(lang === 'th' ? 'en' : 'th')}>
      <Icon n="globe2" />
      <span className={lang === 'th' ? 'on' : ''}>TH</span>
      <span className={lang === 'en' ? 'on' : ''}>EN</span>
    </button>
  )
}

function SignOutButton() {
  const t = useT()
  const nav = useNavigate()
  const { userId, signOut } = useApp()
  if (!userId) return null
  return (
    <button className="circle hide-lg" aria-label={t('profile.signOut')} title={t('profile.signOut')} onClick={async () => { await signOut(); nav('/signin') }}>
      <Icon n="box-arrow-right" />
    </button>
  )
}

export function Page({ title, desc, back, icon, action, hero, compact, children }: {
  title: string; desc?: string; back?: boolean | string; icon?: string; action?: ReactNode; hero?: ReactNode; compact?: boolean; children: ReactNode
}) {
  const t = useT()
  const nav = useNavigate()
  return (
    <>
      <header className={`top ${compact ? 'compact' : ''}`}>
        <div className="col">
          <div className="top-bar">
            {back ? (
              <button className="circle" aria-label={t('common.back')} onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}>
                <Icon n="chevron-left" />
              </button>
            ) : <span className="circle lead" aria-hidden="true"><Icon n={icon ?? 'wallet2'} /></span>}
            <div className="top-text"><h1 className="top-title">{title}</h1>{desc && <span className="top-desc">{desc}</span>}</div>
            <div className="top-act">{action}<LangButton /><SignOutButton /></div>
          </div>
          {hero && <div className="hero">{hero}</div>}
        </div>
      </header>
      <div className="sheet"><div className="col stack-lg">{children}</div></div>
    </>
  )
}

export function Card({ title, icon, tone, children }: { title?: string; icon?: string; tone?: 'navy' | 'line'; children: ReactNode }) {
  return (
    <section className={`card ${tone ?? ''}`}>
      {title && <div className="card-title">{icon && <Icon n={icon} />}{title}</div>}
      {children}
    </section>
  )
}

export function Row({ icon, iconStyle, title, sub, value, to, onClick, children }: {
  icon?: string; iconStyle?: CSSProperties | null; title: ReactNode; sub?: ReactNode; value?: ReactNode; to?: string; onClick?: () => void; children?: ReactNode
}) {
  const inner = (
    <>
      {icon && <span className="ico" style={iconStyle ?? undefined}><Icon n={icon} /></span>}
      <span className="grow">
        <span className="ell" style={{ display: 'block' }}>{title}</span>
        {sub && <span className="small muted" style={{ display: 'block' }}>{sub}</span>}
        {children}
      </span>
      {value && <span className="val num">{value}</span>}
      {(to || onClick) && <span className="chev"><Icon n="chevron-right" /></span>}
    </>
  )
  if (to) return <Link className="row" to={to}>{inner}</Link>
  if (onClick) return <button className="row" onClick={onClick}>{inner}</button>
  return <div className="row">{inner}</div>
}

const BADGE: Record<DebtStatus | 'sample', { icon: string; cls: string }> = {
  verified: { icon: 'patch-check', cls: 'fill' },
  needs_review: { icon: 'exclamation-circle', cls: 'out' },
  user_stated: { icon: 'person', cls: '' },
  sample: { icon: 'box', cls: 'out' },
}
export function Badge({ status }: { status: DebtStatus | 'sample' }) {
  const t = useT()
  const b = BADGE[status]
  return <span className={`badge ${b.cls}`}><Icon n={b.icon} />{t(`status.${status}` as const)}</span>
}
export const SampleTag = () => {
  const t = useT()
  return <span className="badge out"><Icon n="box" />{t('common.sample')}</span>
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const t = useT()
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', key)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', key) }
  }, [onClose])
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="circle" style={{ background: 'var(--tint)', color: 'var(--main)' }} aria-label={t('common.close')} onClick={onClose}><Icon n="x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error && <span className="err" role="alert">{error}</span>}
    </div>
  )
}

export function NumInput({ value, onChange, placeholder }: { value: number | null | undefined; onChange: (v: number | null) => void; placeholder?: string }) {
  return (
    <input className="input num" type="number" inputMode="decimal" min={0} value={value ?? ''} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />
  )
}

export function TextInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input className="input" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
}

export function Seg<T extends string>({ value, options, onChange }: { value: T | null | undefined; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="group">
      {options.map((o) => (
        <button key={o.v} type="button" className={o.v === value ? 'on' : ''} aria-pressed={o.v === value} onClick={() => onChange(o.v)}>{o.label}</button>
      ))}
    </div>
  )
}

// Custom pop-up picker used for day, year and type.
export function Choice<T extends string | number>({ value, options, onChange, title, placeholder, cols = 1 }: {
  value: T | null | undefined; options: { v: T; label: string }[]; onChange: (v: T) => void; title: string; placeholder: string; cols?: number
}) {
  const [open, setOpen] = useState(false)
  const cur = options.find((o) => o.v === value)
  return (
    <>
      <button type="button" className="input" onClick={() => setOpen(true)}>
        <span className={cur ? '' : 'muted'}>{cur?.label ?? placeholder}</span>
        <Icon n="chevron-down" />
      </button>
      {open && (
        <Modal title={title} onClose={() => setOpen(false)}>
          <div className={`pick ${cols === 1 ? 'list1' : cols === 7 ? 'cal' : cols === 4 ? 'yr' : ''}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {options.map((o) => (
              <button key={String(o.v)} type="button" ref={o.v === value ? (el) => el?.scrollIntoView({ block: 'center' }) : undefined} className={o.v === value ? 'on' : ''} onClick={() => { onChange(o.v); setOpen(false) }}>{o.label}</button>
            ))}
          </div>
        </Modal>
      )}
    </>
  )
}

export const range = (a: number, b: number) => Array.from({ length: Math.abs(b - a) + 1 }, (_, i) => (a <= b ? a + i : a - i))
