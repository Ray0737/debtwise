import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useT } from '../i18n'
import { validateProfile, type ProfileField } from '../lib/validate'
import { useApp } from '../store/useApp'
import type { Profile } from '../store/types'
import { Choice, Field, Icon, NumInput, Page, Seg, TextInput, range } from '../ui'

const STEPS: { title: 'onb.aboutTitle' | 'onb.incomeTitle' | 'onb.retireTitle' | 'onb.essentialsTitle' | 'onb.debtsTitle'; fields: ProfileField[] }[] = [
  { title: 'onb.aboutTitle', fields: ['displayName', 'birthYear', 'householdSize'] },
  { title: 'onb.incomeTitle', fields: ['incomeType', 'monthlyIncome', 'otherIncome', 'payDay'] },
  { title: 'onb.retireTitle', fields: ['retireAge', 'postRetireIncome'] },
  { title: 'onb.essentialsTitle', fields: ['monthlyEssentials'] },
  { title: 'onb.debtsTitle', fields: [] },
]

export default function Onboarding() {
  const t = useT()
  const nav = useNavigate()
  const step = Math.min(Math.max(Number(useParams().step) || 1, 1), STEPS.length)
  const { ready, userId, store, profile, lang, refresh } = useApp()
  const [draft, setDraft] = useState<Partial<Profile>>(() => ({ otherIncome: 0, ...(profile ?? {}) }))
  const [errors, setErrors] = useState<Partial<Record<ProfileField, 'required' | 'invalid'>>>({})
  const [busy, setBusy] = useState(false)
  if (!ready) return <div className="center">{t('common.loading')}</div>
  if (!userId) return <Navigate to="/signin" replace />

  const s = STEPS[step - 1]
  const set = <K extends keyof Profile>(k: K, v: Profile[K] | null) => setDraft((d) => ({ ...d, [k]: v }))
  const err = (f: ProfileField) => (errors[f] ? t(errors[f] === 'required' ? 'field.required' : 'field.invalid') : undefined)

  const next = async () => {
    const e = validateProfile(draft, s.fields)
    setErrors(e)
    if (Object.keys(e).length) return
    setBusy(true)
    try {
      const patch: Record<string, unknown> = { lang }
      for (const f of s.fields) patch[f] = draft[f] ?? null
      if (patch.otherIncome == null && s.fields.includes('otherIncome')) patch.otherIncome = 0
      await store!.saveProfile(patch as Partial<Profile>)
      await refresh()
      nav(`/onboarding/${step + 1}`)
    } finally { setBusy(false) }
  }
  const finish = async (to: string) => {
    setBusy(true)
    try { await store!.saveProfile({ onboardedAt: new Date().toISOString() }); await refresh(); nav(to) } finally { setBusy(false) }
  }

  const thisYear = new Date().getFullYear()
  return (
    <main className="main solo">
      <Page
        title={t(s.title)}
        back={step > 1 ? `/onboarding/${step - 1}` : false}
        hero={<span className="small">{t('onb.step', { n: step, total: STEPS.length })}</span>}
      >
        <div className="bar" aria-hidden="true"><i style={{ width: `${(step / STEPS.length) * 100}%` }} /></div>
        {step === 1 && (
          <div className="stack">
            <Field label={t('field.displayName')} error={err('displayName')}><TextInput value={draft.displayName ?? ''} onChange={(v) => set('displayName', v)} placeholder={t('ph.name')} /></Field>
            <Field label={t('field.birthYear')} error={err('birthYear')}>
              <Choice title={t('picker.year')} placeholder={t('ph.pickYear')} cols={4} value={draft.birthYear} onChange={(v) => set('birthYear', v)}
                options={range(thisYear - 16, thisYear - 90).map((y) => ({ v: y, label: String(y) }))} />
            </Field>
            <Field label={t('field.household')} error={err('householdSize')}><NumInput value={draft.householdSize} onChange={(v) => set('householdSize', v)} /></Field>
          </div>
        )}
        {step === 2 && (
          <div className="stack">
            <Field label={t('field.incomeType')}>
              <Seg value={draft.incomeType} onChange={(v) => set('incomeType', v)}
                options={[{ v: 'salary', label: t('field.income.salary') }, { v: 'freelance', label: t('field.income.freelance') }, { v: 'both', label: t('field.income.both') }]} />
            </Field>
            <Field label={t('field.monthlyIncome')} error={err('monthlyIncome')}><NumInput value={draft.monthlyIncome} onChange={(v) => set('monthlyIncome', v)} /></Field>
            <Field label={t('field.otherIncome')} error={err('otherIncome')}><NumInput value={draft.otherIncome} onChange={(v) => set('otherIncome', v ?? 0)} /></Field>
            <Field label={t('field.payDay')} error={err('payDay')}>
              <Choice title={t('picker.day')} placeholder={t('ph.pickDay')} cols={7} value={draft.payDay} onChange={(v) => set('payDay', v)}
                options={range(1, 31).map((d) => ({ v: d, label: String(d) }))} />
            </Field>
          </div>
        )}
        {step === 3 && (
          <div className="stack">
            <Field label={t('field.retireAge')} error={err('retireAge')}><NumInput value={draft.retireAge} onChange={(v) => set('retireAge', v)} /></Field>
            <Field label={t('field.postRetire')} error={err('postRetireIncome')}><NumInput value={draft.postRetireIncome} onChange={(v) => set('postRetireIncome', v)} /></Field>
          </div>
        )}
        {step === 4 && (
          <Field label={t('field.essentials')} error={err('monthlyEssentials')}><NumInput value={draft.monthlyEssentials} onChange={(v) => set('monthlyEssentials', v)} /></Field>
        )}
        {step === 5 && <p className="muted">{t('onb.debtsLine')}</p>}

        {step < STEPS.length ? (
          <div className="between">
            {step === 4 ? <button className="btn soft" disabled={busy} onClick={() => nav('/onboarding/5')}>{t('common.later')}</button> : <span />}
            <button className="btn" disabled={busy} onClick={next}>{t('common.next')}<Icon n="arrow-right" /></button>
          </div>
        ) : (
          <div className="between">
            <button className="btn soft" disabled={busy} onClick={() => finish('/')}>{t('common.later')}</button>
            <button className="btn" disabled={busy} onClick={() => finish('/debt/add')}><Icon n="plus-lg" />{t('onb.addNow')}</button>
          </div>
        )}
      </Page>
    </main>
  )
}
