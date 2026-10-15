import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { LangToggle } from '../components/LangToggle'
import { ProfileForm } from '../components/ProfileForm'
import { useT, type Key } from '../i18n'
import { loadDemo } from '../lib/demo'
import { validateProfile, type ProfileField } from '../lib/validate'
import { useApp } from '../store/useApp'
import type { Profile } from '../store/types'

const STEPS: { title: Key; fields: ProfileField[] }[] = [
  { title: 'onb.aboutTitle', fields: ['displayName', 'birthYear', 'householdSize'] },
  { title: 'onb.incomeTitle', fields: ['incomeType', 'monthlyIncome', 'otherIncome', 'payDay'] },
  { title: 'onb.retireTitle', fields: ['retireAge', 'postRetireIncome'] },
  { title: 'onb.essentialsTitle', fields: ['monthlyEssentials'] },
  { title: 'onb.debtsTitle', fields: [] },
]

export default function Onboarding() {
  const t = useT()
  const nav = useNavigate()
  const { step: raw } = useParams()
  const { userId, store, profile, refresh } = useApp()
  const step = Math.min(Math.max(Number(raw) || 1, 1), STEPS.length)
  const [value, setValue] = useState<Partial<Profile>>({ otherIncome: 0, ...(profile ?? {}) })
  const [errors, setErrors] = useState<ReturnType<typeof validateProfile>>({})
  if (!userId) return <Navigate to="/signin" replace />
  const cur = STEPS[step - 1]

  const next = async () => {
    const e = validateProfile(value, cur.fields)
    setErrors(e)
    if (Object.keys(e).length) return
    await store!.saveProfile(value)
    if (step < STEPS.length) nav(`/onboarding/${step + 1}`)
  }
  const finish = async (to: string) => {
    await store!.saveProfile({ ...value, onboardedAt: new Date().toISOString() })
    await refresh()
    nav(to)
  }
  const demo = async () => {
    await loadDemo(store!)
    await refresh()
    nav('/')
  }

  return (
    <div className="app" style={{ alignItems: 'center' }}>
      <div className="main" style={{ paddingBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step > 1 ? <button className="btn btn-text" onClick={() => nav(`/onboarding/${step - 1}`)}>{t('common.back')}</button> : <span />}
          <LangToggle />
        </div>
        <div className="step-indicator" aria-label={t('onb.step', { n: step, total: STEPS.length })}>
          {STEPS.map((_, i) => (
            <span key={i} style={{ display: 'contents' }}>
              {i > 0 && <span className={`step-line${i < step ? ' done' : ''}`} />}
              <span className={`step-dot${i + 1 === step ? ' active' : i + 1 < step ? ' done' : ''}`}>{i + 1 < step ? '✓' : i + 1}</span>
            </span>
          ))}
        </div>
        <h1 className="h1">{t(cur.title)}</h1>
        {step < STEPS.length ? (
          <>
            <ProfileForm fields={cur.fields} value={value} errors={errors} onChange={(p) => setValue((v) => ({ ...v, ...p }))} />
            {step === 4 && <button className="btn btn-text" onClick={() => nav('/onboarding/5')}>{t('common.later')}</button>}
            <button className="btn btn-primary" onClick={next}>{t('common.next')}</button>
          </>
        ) : (
          <>
            <p className="muted">{t('onb.debtsLine')}</p>
            <button className="btn btn-primary" onClick={() => finish('/debt/add')}>{t('onb.addNow')}</button>
            <button className="btn btn-secondary" onClick={() => finish('/')}>{t('common.later')}</button>
            <button className="btn btn-text" onClick={demo}>{t('profile.loadDemo')} ({t('common.demo')})</button>
          </>
        )}
      </div>
    </div>
  )
}
