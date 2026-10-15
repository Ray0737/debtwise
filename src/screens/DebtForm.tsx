import { useState } from 'react'
import type { Debt, DebtType } from '../engine'
import { useT } from '../i18n'
import type { DebtInput } from '../store/types'
import { Choice, Field, NumInput, Icon, TextInput, range } from '../ui'

export const TYPES: DebtType[] = ['credit_card', 'personal', 'car', 'home', 'student', 'informal']
export const TYPE_ICON: Record<DebtType, string> = {
  credit_card: 'credit-card', personal: 'person-vcard', car: 'car-front', home: 'house', student: 'mortarboard', informal: 'people',
}

export function DebtForm({ initial, onSave, onCancel }: { initial?: Debt; onSave: (d: DebtInput) => Promise<void>; onCancel?: () => void }) {
  const t = useT()
  const [d, setD] = useState<Partial<Debt>>(initial ?? { type: 'personal' })
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof Debt>(k: K, v: Debt[K] | null) => setD((x) => ({ ...x, [k]: v }))

  const save = async () => {
    const e = { lender: !d.lender?.trim(), balance: !(d.balance && d.balance > 0), minPayment: d.minPayment == null }
    setErrors(e)
    if (Object.values(e).some(Boolean)) return
    setBusy(true)
    try {
      const type = d.type ?? 'personal'
      await onSave({
        lender: d.lender!.trim(), type, label: d.label?.trim() || t(`type.${type}` as const), balance: d.balance!,
        ratePct: d.ratePct ?? null, minPayment: d.minPayment!, dueDay: d.dueDay ?? null, termMonthsLeft: d.termMonthsLeft ?? null,
        status: initial?.status ?? 'user_stated', sourceId: initial?.sourceId ?? null,
      })
    } finally { setBusy(false) }
  }
  const req = (k: string) => (errors[k] ? t('field.required') : undefined)

  return (
    <div className="stack">
      <Field label={t('debt.lender')} error={req('lender')}><TextInput value={d.lender ?? ''} onChange={(v) => set('lender', v)} placeholder={t('ph.lender')} /></Field>
      <Field label={t('debt.type')}>
        <Choice title={t('debt.type')} placeholder={t('debt.type')} value={d.type} onChange={(v) => set('type', v)}
          options={TYPES.map((v) => ({ v, label: t(`type.${v}` as const) }))} />
      </Field>
      <Field label={t('debt.label')}><TextInput value={d.label ?? ''} onChange={(v) => set('label', v)} placeholder={t('ph.label')} /></Field>
      <Field label={t('debt.balance')} error={req('balance')}><NumInput value={d.balance} onChange={(v) => set('balance', v ?? 0)} /></Field>
      <Field label={t('debt.rate')}><NumInput value={d.ratePct} onChange={(v) => set('ratePct', v)} /></Field>
      <Field label={t('debt.minPayment')} error={req('minPayment')}><NumInput value={d.minPayment} onChange={(v) => set('minPayment', v ?? 0)} /></Field>
      <Field label={t('debt.dueDay')}>
        <Choice title={t('picker.day')} placeholder={t('ph.pickDay')} cols={7} value={d.dueDay} onChange={(v) => set('dueDay', v)}
          options={range(1, 31).map((n) => ({ v: n, label: String(n) }))} />
      </Field>
      <p className="small muted">{t('picker.dayHint')}</p>
      <Field label={t('debt.termLeft')}><NumInput value={d.termMonthsLeft} onChange={(v) => set('termMonthsLeft', v)} /></Field>
      <div className="between">
        {onCancel ? <button className="btn soft" onClick={onCancel}>{t('common.cancel')}</button> : <span />}
        <button className="btn" disabled={busy} onClick={save}><Icon n="check-lg" />{t('common.save')}</button>
      </div>
    </div>
  )
}
