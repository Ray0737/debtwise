import type { InputHTMLAttributes, ReactNode } from 'react'
import { useT } from '../i18n'
import { Icon } from './Icon'

export function Field({ label, error, children }: { label: string; error?: 'required' | 'invalid'; children: ReactNode }) {
  const t = useT()
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {error && (
        <span className="err" role="alert"><Icon name="warn" size={14} />{t(error === 'required' ? 'field.required' : 'field.invalid')}</span>
      )}
    </div>
  )
}

type Base = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & { icon?: string; unit?: string }

export function TextInput({ value, onChange, icon, unit, ...rest }: Base & { value: string | null | undefined; onChange: (v: string) => void }) {
  return (
    <label className="ctl">
      {icon && <Icon name={icon} size={16} />}
      <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...rest} />
      {unit && <span className="unit">{unit}</span>}
    </label>
  )
}

export function NumInput({ value, onChange, icon, unit, ...rest }: Base & { value: number | null | undefined; onChange: (v: number | null) => void }) {
  return (
    <label className="ctl">
      {icon && <Icon name={icon} size={16} />}
      <input className="num" inputMode="decimal" value={value ?? ''} placeholder="0"
        onChange={(e) => { const s = e.target.value; onChange(s === '' ? null : Number(s)) }} {...rest} />
      {unit && <span className="unit">{unit}</span>}
    </label>
  )
}
