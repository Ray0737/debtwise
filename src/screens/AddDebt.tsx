import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DebtForm } from '../components/DebtForm'
import { Icon, IconTile } from '../components/Icon'
import { Sheet } from '../components/Sheet'
import { useT } from '../i18n'
import { useApp } from '../store/useApp'

export default function AddDebt() {
  const t = useT()
  const nav = useNavigate()
  const { store, refresh, lang } = useApp()
  const [form, setForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const file = useRef<HTMLInputElement>(null)

  const onFile = async (f: File | undefined) => {
    if (!f) return
    setBusy(true); setError(false)
    try {
      const { extractDocument } = await import('../lib/ai')
      const candidates = await extractDocument(f, lang)
      nav('/debt/review', { state: { candidates, fileName: f.name } })
    } catch { setError(true) } finally { setBusy(false) }
  }

  return (
    <>
      <button className="btn btn-text" style={{ alignSelf: 'flex-start' }} onClick={() => nav('/debt')}><Icon name="back" size={14} />{t('common.back')}</button>
      <h1 className="h1">{t('add.title')}</h1>
      <div className="joined">
        <div className="row" role="button" tabIndex={0} onClick={() => file.current?.click()}>
          <IconTile name="upload" tone="red" />
          <div className="grow"><div className="strong">{t('add.upload')}</div><div className="muted small">{t('add.uploadHint')}</div><div className="muted small">{t('add.uploadNote')}</div></div>
        </div>
        <div className="row" role="button" tabIndex={0} onClick={() => nav('/')}>
          <IconTile name="mic" tone="red" /><div className="grow strong">{t('add.talk')}</div>
        </div>
        <div className="row" role="button" tabIndex={0} onClick={() => setForm(true)}>
          <IconTile name="edit" tone="red" /><div className="grow strong">{t('add.form')}</div>
        </div>
      </div>
      <input ref={file} type="file" accept="image/*,application/pdf" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {busy && <p role="status">{t('common.loading')}</p>}
      {error && <p className="err" role="alert">{t('common.error')}</p>}
      {form && (
        <Sheet onClose={() => setForm(false)}>
          <DebtForm onCancel={() => setForm(false)} onSave={async (d) => { await store!.saveDebt(d); await refresh(); nav('/debt') }} />
        </Sheet>
      )}
    </>
  )
}
