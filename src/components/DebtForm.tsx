import { useState } from 'react'
import type { DebtType } from '../engine'
import { useT } from '../i18n'
import type { DebtInput } from '../store/types'
import { Field, NumInput } from './Field'

const TYPES: DebtType[] = ['credit_card', 'personal', 'car', 'home', 'student', 'informal']

export function DebtForm({ initial, onSave, onCancel }: { initial?: Partial<DebtInput>; onSave: (d: DebtInput) => void | Promise<void>; onCancel: () => void }) {
  const t = useT()
  const [v, setV] = useState<Partial<DebtInput>>({ type: 'personal', status: 'user_stated', sourceId: null, ...initial })
  const [tried, setTried] = useState(false)
  const bad = {
    lender: !v.lender?.trim(),
    balance: v.balance == null || v.balance < 0,
    minPayment: v.minPayment == null || v.minPayment < 0,
    ratePct: v.ratePct != null && (v.ratePct < 0 || v.ratePct > 100),
    dueDay: v.dueDay != null && (v.dueDay < 1 || v.dueDay > 31),
  }
  const submit = async () => {
    setTried(true)
    if (Object.values(bad).some(Boolean)) return
    await onSave({
      lender: v.lender!.trim(), type: v.type as DebtType, label: v.label?.trim() || t(`type.${v.type as DebtType}` as const),
      balance: v.balance!, ratePct: v.ratePct ?? null, minPayment: v.minPayment!, dueDay: v.dueDay ?? null,
      termMonthsLeft: v.termMonthsLeft ?? null, status: v.status ?? 'user_stated', sourceId: v.sourceId ?? null,
    })
  }
  const e = (k: keyof typeof bad): 'required' | 'invalid' | undefined => (tried && bad[k] ? (k === 'lender' || k === 'balance' || k === 'minPayment' ? 'required' : 'invalid') : undefined)
  return (
    <>
      <Field label={t('debt.type')}>
        <div className="chips">
          {TYPES.map((k) => <button key={k} type="button" className={`chip${v.type === k ? ' on' : ''}`} onClick={() => setV({ ...v, type: k })}>{t(`type.${k}` as const)}</button>)}
        </div>
      </Field>
      <Field label={t('debt.lender')} error={e('lender')}><input className="input" value={v.lender ?? ''} onChange={(x) => setV({ ...v, lender: x.target.value })} /></Field>
      <Field label={t('debt.label')}><input className="input" value={v.label ?? ''} onChange={(x) => setV({ ...v, label: x.target.value })} /></Field>
      <Field label={t('debt.balance')} error={e('balance')}><NumInput value={v.balance} onChange={(n) => setV({ ...v, balance: n ?? undefined })} /></Field>
      <Field label={t('debt.rate')} error={e('ratePct')}><NumInput value={v.ratePct} onChange={(n) => setV({ ...v, ratePct: n })} /></Field>
      <Field label={t('debt.minPayment')} error={e('minPayment')}><NumInput value={v.minPayment} onChange={(n) => setV({ ...v, minPayment: n ?? undefined })} /></Field>
      <Field label={t('debt.dueDay')} error={e('dueDay')}><NumInput value={v.dueDay} onChange={(n) => setV({ ...v, dueDay: n })} /></Field>
      <Field label={t('debt.termLeft')}><NumInput value={v.termMonthsLeft} onChange={(n) => setV({ ...v, termMonthsLeft: n })} /></Field>
      <button className="btn btn-primary" onClick={submit}>{t('common.save')}</button>
      <button className="btn btn-text" onClick={onCancel}>{t('common.cancel')}</button>
    </>
  )
}
