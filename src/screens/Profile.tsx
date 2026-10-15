import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { loadDemo, removeDemo } from '../lib/demo'
import { validateProfile, type ProfileField } from '../lib/validate'
import type { Profile as ProfileT } from '../store/types'
import { useApp } from '../store/useApp'
import { Card, Choice, Field, Icon, Modal, NumInput, Page, Row, Seg, TextInput, range } from '../ui'

const FIELDS: ProfileField[] = ['displayName', 'birthYear', 'householdSize', 'incomeType', 'monthlyIncome', 'otherIncome', 'payDay', 'retireAge', 'postRetireIncome', 'monthlyEssentials']

export default function Profile() {
  const t = useT()
  const nav = useNavigate()
  const { profile, store, refresh, signOut, lang, setLang, clearOneOffs } = useApp()
  const [draft, setDraft] = useState<Partial<ProfileT>>(profile ?? {})
  const [errors, setErrors] = useState<Partial<Record<ProfileField, 'required' | 'invalid'>>>({})
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [del, setDel] = useState(false)
  const [word, setWord] = useState('')
  if (!profile || !store) return null

  const set = <K extends keyof ProfileT>(k: K, v: ProfileT[K] | null) => { setSaved(false); setDraft((d) => ({ ...d, [k]: v })) }
  const err = (f: ProfileField) => (errors[f] ? t(errors[f] === 'required' ? 'field.required' : 'field.invalid') : undefined)

  const save = async () => {
    const e = validateProfile(draft, FIELDS)
    setErrors(e)
    if (Object.keys(e).length) return
    const patch: Record<string, unknown> = {}
    for (const f of FIELDS) patch[f] = draft[f] ?? (f === 'otherIncome' ? 0 : null)
    await store.saveProfile(patch as Partial<ProfileT>)
    await refresh()
    setSaved(true)
  }
  const run = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); await refresh() } finally { setBusy(false) } }
  const exportAll = async () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(await store.exportAll(), null, 2)], { type: 'application/json' }))
    a.download = 'debtwise-export.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const thisYear = new Date().getFullYear()

  return (
    <Page icon="person" title={t('profile.title')} desc={t('desc.profile')} hero={<><span className="big">{profile.displayName || t('app.name')}</span><span className="small">{t('profile.dataLine')}</span></>}>
      <Card title={t('profile.title')} icon="person">
        <Field label={t('field.displayName')}><TextInput value={draft.displayName ?? ''} onChange={(v) => set('displayName', v)} placeholder={t('ph.name')} /></Field>
        <Field label={t('field.birthYear')} error={err('birthYear')}>
          <Choice title={t('picker.year')} placeholder={t('ph.pickYear')} cols={4} value={draft.birthYear} onChange={(v) => set('birthYear', v)}
            options={range(thisYear - 16, thisYear - 90).map((y) => ({ v: y, label: String(y) }))} />
        </Field>
        <Field label={t('field.household')}><NumInput value={draft.householdSize} onChange={(v) => set('householdSize', v)} /></Field>
        <Field label={t('field.incomeType')}>
          <Seg value={draft.incomeType} onChange={(v) => set('incomeType', v)}
            options={[{ v: 'salary', label: t('field.income.salary') }, { v: 'freelance', label: t('field.income.freelance') }, { v: 'both', label: t('field.income.both') }]} />
        </Field>
        <Field label={t('field.monthlyIncome')} error={err('monthlyIncome')}><NumInput value={draft.monthlyIncome} onChange={(v) => set('monthlyIncome', v)} /></Field>
        <Field label={t('field.otherIncome')}><NumInput value={draft.otherIncome} onChange={(v) => set('otherIncome', v ?? 0)} /></Field>
        <Field label={t('field.payDay')} error={err('payDay')}>
          <Choice title={t('picker.day')} placeholder={t('ph.pickDay')} cols={7} value={draft.payDay} onChange={(v) => set('payDay', v)}
            options={range(1, 31).map((d) => ({ v: d, label: String(d) }))} />
        </Field>
        <Field label={t('field.retireAge')} error={err('retireAge')}><NumInput value={draft.retireAge} onChange={(v) => set('retireAge', v)} /></Field>
        <Field label={t('field.postRetire')}><NumInput value={draft.postRetireIncome} onChange={(v) => set('postRetireIncome', v)} /></Field>
        <Field label={t('field.essentials')}><NumInput value={draft.monthlyEssentials} onChange={(v) => set('monthlyEssentials', v)} /></Field>
        <div className="between">
          <span className="small" role="status">{saved && <><Icon n="check-circle" /> {t('profile.saved')}</>}</span>
          <button className="btn" onClick={save}><Icon n="check-lg" />{t('common.save')}</button>
        </div>
      </Card>

      <Card title={t('profile.language')} icon="translate">
        <Seg value={lang} onChange={setLang} options={[{ v: 'th', label: 'ไทย' }, { v: 'en', label: 'English' }]} />
      </Card>

      <Card title={t('profile.data')} icon="database">
        <div className="list">
          <Row icon="download" title={t('profile.export')} onClick={exportAll} />
          <Row icon="people" title={t('profile.loadDemo')} onClick={() => run(() => loadDemo(store))} />
          <Row icon="eraser" title={t('profile.removeDemo')} onClick={() => run(() => removeDemo(store))} />
        </div>
        <button className="btn danger block" disabled={busy} onClick={() => setDel(true)}><Icon n="trash3" />{t('profile.deleteAll')}</button>
      </Card>

      <button className="btn soft block" onClick={async () => { await signOut(); nav('/signin') }}><Icon n="box-arrow-right" />{t('profile.signOut')}</button>

      {del && (
        <Modal title={t('profile.deleteTitle')} tone="danger" onClose={() => { setDel(false); setWord('') }}>
          <div className="stack">
            <p>{t('profile.deleteConfirm')}</p>
            <TextInput value={word} onChange={setWord} placeholder="delete" />
            <div className="btnrow">
              <button className="btn soft block" onClick={() => { setDel(false); setWord('') }}>{t('common.cancel')}</button>
              <button className="btn danger block" disabled={word.trim().toLowerCase() !== 'delete' || busy}
                onClick={() => run(async () => { await store.deleteAll(); clearOneOffs(); setDel(false); setWord('') })}><Icon n="trash3" />{t('profile.deleteBtn')}</button>
            </div>
          </div>
        </Modal>
      )}
    </Page>
  )
}
