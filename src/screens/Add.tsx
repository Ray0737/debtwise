import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../i18n'
import { BROWSER_TYPES, inspectFile, safeFileName, type UploadReason } from '../../api/_lib/upload'
import { extractDocument } from '../lib/ai'
import { loadUploads, recordUpload } from '../lib/uploadLog'
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
  const [blocked, setBlocked] = useState<UploadReason | null>(null)
  const [log, setLog] = useState(loadUploads)

  const upload = async (f: File) => {
    setBusy(true); setError(false); setBlocked(null)
    try {
      const name = safeFileName(f.name)
      const v = await inspectFile(new Uint8Array(await f.arrayBuffer()), f.type, BROWSER_TYPES)
      setLog(recordUpload({ at: new Date().toISOString(), name, size: v.size, ok: v.ok, reason: v.ok ? undefined : v.reason, sha: v.ok ? v.sha256.slice(0, 12) : undefined }))
      if (!v.ok) return setBlocked(v.reason)
      const candidates = await extractDocument(f, lang)
      nav('/debt/review', { state: { candidates, fileName: name } })
    } catch { setError(true) } finally { setBusy(false) }
  }

  return (
    <Page title={t('add.title')} desc={t('desc.add')} back="/debt">
      <div className="card">
        <div className="list">
          <Row icon={busy ? 'hourglass-split' : 'file-earmark-arrow-up'} title={busy ? t('common.loading') : t('add.upload')} sub={t('add.uploadHint')} onClick={() => !busy && file.current?.click()} />
          <Row icon="mic" title={t('add.talk')} onClick={() => nav('/chat')} />
          <Row icon="pencil-square" title={t('add.form')} onClick={() => setForm(true)} />
        </div>
        <p className="small muted"><Icon n="shield-lock" /> {t('add.uploadNote')}</p>
        <input ref={file} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void upload(f) }} />
        {error && <p className="err" role="alert">{t('common.error')}</p>}
        {blocked && <p className="err" role="alert"><Icon n="shield-exclamation" /> {t('upload.blocked', { reason: t(`upload.r.${blocked}` as const) })}</p>}
        {log.length > 0 && (
          <div className="uplog">
            <span className="small muted">{t('upload.log')}</span>
            {log.slice(0, 5).map((e) => (
              <span key={e.at} className="small uprow">
                <Icon n={e.ok ? 'check-circle' : 'x-octagon'} />
                <span className="ell">{e.name}</span>
                <span className="muted">{Math.max(1, Math.round(e.size / 1024))} KB{e.sha ? ` · ${e.sha.slice(0, 8)}` : ''}</span>
                {!e.ok && e.reason && <span className="err">{t(`upload.r.${e.reason}` as const)}</span>}
              </span>
            ))}
          </div>
        )}
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
