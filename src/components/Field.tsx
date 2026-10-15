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
        <span className="err" role="alert"><Icon name="warn" size={18} />{t(error === 'required' ? 'field.required' : 'field.invalid')}</span>
      )}
    </div>
  )
}

export function NumInput({ value, onChange, ...rest }: { value: number | null | undefined; onChange: (v: number | null) => void } & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <input className="input num" inputMode="decimal" value={value ?? ''}
      onChange={(e) => { const s = e.target.value; onChange(s === '' ? null : Number(s)) }} {...rest} />
  )
}
