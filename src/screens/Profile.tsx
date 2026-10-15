import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LangToggle } from '../components/LangToggle'
import { ProfileForm } from '../components/ProfileForm'
import { useT } from '../i18n'
import { loadDemo, removeDemo } from '../lib/demo'
import { validateProfile, type ProfileField } from '../lib/validate'
import { useApp } from '../store/useApp'
import type { Profile } from '../store/types'

const ALL: ProfileField[] = ['displayName', 'birthYear', 'householdSize', 'incomeType', 'monthlyIncome', 'otherIncome', 'payDay', 'retireAge', 'postRetireIncome', 'monthlyEssentials']

export default function ProfileScreen() {
  const t = useT()
  const nav = useNavigate()
  const { store, profile, refresh, signOut } = useApp()
  const [value, setValue] = useState<Partial<Profile>>(profile ?? {})
  const [errors, setErrors] = useState<ReturnType<typeof validateProfile>>({})
  const [saved, setSaved] = useState(false)
  const [confirm, setConfirm] = useState('')

  const save = async () => {
    const e = validateProfile(value, ALL)
    setErrors(e)
    if (Object.keys(e).length) return
    await store!.saveProfile(value)
    await refresh()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }
  const exportData = async () => {
    const blob = new Blob([JSON.stringify(await store!.exportAll(), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'debtwise-export.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const wipe = async () => {
    await store!.deleteAll()
    await signOut()
    nav('/signin')
  }

  return (
    <>
      <h1 className="h1">{t('profile.title')}</h1>
      <div className="card">
        <ProfileForm fields={ALL} value={value} errors={errors} onChange={(p) => setValue((v) => ({ ...v, ...p }))} />
        <button className="btn btn-primary" onClick={save}>{t('common.save')}</button>
        {saved && <p role="status">{t('profile.saved')}</p>}
      </div>
      <div className="card">
        <span>{t('profile.language')}</span>
        <LangToggle />
      </div>
      <div className="card">
        <h2 className="h2">{t('profile.data')}</h2>
        <p className="muted">{t('profile.dataLine')}</p>
        <button className="btn btn-secondary" onClick={exportData}>{t('profile.export')}</button>
        <button className="btn btn-secondary" onClick={async () => { await loadDemo(store!); await refresh() }}>{t('profile.loadDemo')} ({t('common.demo')})</button>
        <button className="btn btn-secondary" onClick={async () => { await removeDemo(store!); await refresh() }}>{t('profile.removeDemo')}</button>
        <p className="muted small">{t('profile.deleteConfirm')}</p>
        <input className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button className="btn btn-danger" disabled={confirm.trim().toLowerCase() !== 'delete'} onClick={wipe}>{t('profile.deleteAll')}</button>
      </div>
      <button className="btn btn-secondary" onClick={async () => { await signOut(); nav('/signin') }}>{t('profile.signOut')}</button>
    </>
  )
}
