import { useState } from 'react'
import type { Debt, DebtType } from '../engine'
import { useT } from '../i18n'
import { THAI_BANKS } from '../lib/bank'
import { LABEL } from '../lib/validate'
import type { DebtInput } from '../store/types'
import { useApp } from '../store/useApp'
import { Choice, Field, NumInput, Icon, TextInput, range, showFirstError } from '../ui'

export const TYPES: DebtType[] = ['credit_card', 'personal', 'car', 'home', 'student', 'informal']
export const TYPE_ICON: Record<DebtType, string> = {
  credit_card: 'credit-card', personal: 'person-vcard', car: 'car-front', home: 'house', student: 'mortarboard', informal: 'people',
}

export function DebtForm({ initial, onSave, onCancel }: { initial?: Debt; onSave: (d: DebtInput) => Promise<void>; onCancel?: () => void }) {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const [d, setD] = useState<Partial<Debt>>(initial ?? { type: 'personal' })
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  // Other: a lender that is not in the list, typed by hand. Starts open when editing a lender we do not know.
  const [other, setOther] = useState(() => Boolean(initial?.lender) && !THAI_BANKS.some((b) => b.en === initial?.lender))
  const set = <K extends keyof Debt>(k: K, v: Debt[K] | null) => setD((x) => ({ ...x, [k]: v }))

  const save = async () => {
    const e = {
      lender: !d.lender?.trim(), lenderText: Boolean(d.lender?.trim()) && !LABEL.test(d.lender!.trim()),
      label: Boolean(d.label?.trim()) && !LABEL.test(d.label!.trim()),
      balance: !(d.balance && d.balance > 0), minPayment: d.minPayment == null,
    }
    setErrors(e)
    if (Object.values(e).some(Boolean)) return showFirstError()
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
  const text = (k: string) => (errors[k] ? t('field.hasLetters') : undefined)

  return (
    <div className="stack">
      <Field label={t('debt.lender')} error={req('lender') ?? text('lenderText')}>
        <div className="banks" role="group" aria-label={t('debt.lender')}>
          {THAI_BANKS.map((b) => {
            const on = !other && d.lender === b.en
            return (
              <button key={b.en} type="button" className={`bank ${on ? 'on' : ''}`} style={{ background: b.bg, color: b.fg }} aria-pressed={on}
                onClick={() => { setOther(false); set('lender', b.en) }}>
                <Icon n={b.icon} />{lang === 'th' ? b.th : b.en}{on && <Icon n="check-lg" />}
              </button>
            )
          })}
          <button type="button" className={`bank other ${other ? 'on' : ''}`} aria-pressed={other}
            onClick={() => { setOther(true); if (THAI_BANKS.some((b) => b.en === d.lender)) set('lender', '') }}>
            <Icon n="pencil" />{t('debt.otherLender')}{other && <Icon n="check-lg" />}
          </button>
        </div>
        {other && <TextInput value={d.lender ?? ''} onChange={(v) => set('lender', v)} placeholder={t('ph.lender')} />}
      </Field>
      <Field label={t('debt.type')}>
        <Choice title={t('debt.type')} placeholder={t('debt.type')} value={d.type} onChange={(v) => set('type', v)}
          options={TYPES.map((v) => ({ v, label: t(`type.${v}` as const) }))} />
      </Field>
      <Field label={t('debt.label')} error={text('label')}><TextInput value={d.label ?? ''} onChange={(v) => set('label', v)} placeholder={t('ph.label')} /></Field>
      <Field label={t('debt.balance')} error={req('balance')}><NumInput value={d.balance} onChange={(v) => set('balance', v)} /></Field>
      <Field label={t('debt.rate')}><NumInput value={d.ratePct} onChange={(v) => set('ratePct', v)} /></Field>
      <Field label={t('debt.minPayment')} error={req('minPayment')}><NumInput value={d.minPayment} onChange={(v) => set('minPayment', v)} /></Field>
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
