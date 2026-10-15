import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { extractDocument } from '../lib/ai'
import { useApp } from '../store/useApp'
import { Card, Icon, Page, Row } from '../ui'
import { DebtForm } from './DebtForm'

export default function Add() {
  const t = useT()
  const nav = useNavigate()
  const { store, refresh, lang } = useApp()
  const file = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  const upload = async (f: File) => {
    setBusy(true); setError(false)
    try {
      const candidates = await extractDocument(f, lang)
      nav('/debt/review', { state: { candidates, fileName: f.name } })
    } catch { setError(true) } finally { setBusy(false) }
  }

  return (
    <Page title={t('add.title')} back="/debt">
      <div className="card">
        <div className="list">
          <Row icon={busy ? 'hourglass-split' : 'file-earmark-arrow-up'} title={busy ? t('common.loading') : t('add.upload')} sub={t('add.uploadHint')} onClick={() => !busy && file.current?.click()} />
          <Row icon="mic" title={t('add.talk')} onClick={() => nav('/')} />
          <Row icon="pencil-square" title={t('add.form')} onClick={() => setForm(true)} />
        </div>
        <p className="small muted"><Icon n="shield-lock" /> {t('add.uploadNote')}</p>
        <input ref={file} type="file" accept="application/pdf,image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void upload(f) }} />
        {error && <p className="err" role="alert">{t('common.error')}</p>}
      </div>
      {form && (
        <Card title={t('add.form')} icon="pencil-square">
          <DebtForm onCancel={() => setForm(false)} onSave={async (v) => {
            const src = await store!.saveSource({ kind: 'form' })
            await store!.saveDebt({ ...v, sourceId: src.id })
            await refresh()
            nav('/debt')
          }} />
        </Card>
      )}
    </Page>
  )
}
