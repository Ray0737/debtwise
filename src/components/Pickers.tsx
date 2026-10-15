import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n'
import { Icon } from './Icon'
import { Sheet } from './Sheet'

function Trigger({ icon, text, placeholder, onClick }: { icon: string; text: string | null; placeholder: string; onClick: () => void }) {
  return (
    <button type="button" className="ctl btnlike" onClick={onClick}>
      <Icon name={icon} size={16} />
      {text ? <span className="val num">{text}</span> : <span className="ph" style={{ flex: 1 }}>{placeholder}</span>}
    </button>
  )
}

// Day of the month, 1 to 31. Used for pay day and due day.
export function DayPicker({ value, onChange, optional }: { value: number | null | undefined; onChange: (v: number | null) => void; optional?: boolean }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const pick = (d: number) => { onChange(d); setOpen(false) }
  return (
    <>
      <Trigger icon="calendar" text={value ? String(value) : null} placeholder={t('ph.pickDay')} onClick={() => setOpen(true)} />
      {open && (
        <Sheet onClose={() => setOpen(false)}>
          <div className="sheet-title">
            <span className="h2">{t('picker.day')}</span>
            {optional && value ? <button className="btn btn-text" onClick={() => { onChange(null); setOpen(false) }}>{t('common.clear')}</button> : null}
          </div>
          <div className="pick-grid">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <button key={d} type="button" className={`pick${value === d ? ' on' : ''}${d > 28 ? ' dim' : ''}`} onClick={() => pick(d)}>{d}</button>
            ))}
          </div>
          <p className="muted small">{t('picker.dayHint')}</p>
        </Sheet>
      )}
    </>
  )
}

// Year, newest first. Used for birth year.
export function YearPicker({ value, onChange, from = 1930 }: { value: number | null | undefined; onChange: (v: number | null) => void; from?: number }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const now = new Date().getUTCFullYear()
  const years = Array.from({ length: now - from + 1 }, (_, i) => now - i)
  const sel = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (open) sel.current?.scrollIntoView({ block: 'center' }) }, [open])
  return (
    <>
      <Trigger icon="calendar" text={value ? String(value) : null} placeholder={t('ph.pickYear')} onClick={() => setOpen(true)} />
      {open && (
        <Sheet onClose={() => setOpen(false)}>
          <div className="sheet-title"><span className="h2">{t('picker.year')}</span></div>
          <div className="pick-grid years">
            {years.map((y) => (
              <button key={y} ref={y === value ? sel : undefined} type="button" className={`pick${value === y ? ' on' : ''}`} onClick={() => { onChange(y); setOpen(false) }}>{y}</button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  )
}
