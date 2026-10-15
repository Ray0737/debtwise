import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { NumInput } from '../components/Field'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import type { Candidate } from '../lib/ai'
import { useApp } from '../store/useApp'

export default function Review() {
  const t = useT()
  const nav = useNavigate()
  const { store, refresh } = useApp()
  const state = useLocation().state as { candidates?: Candidate[]; fileName?: string } | null
  const [rows, setRows] = useState((state?.candidates ?? []).map((c) => ({ ...c, ok: false })))
  const [busy, setBusy] = useState(false)
  const edit = (i: number, patch: Partial<Candidate & { ok: boolean }>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const chosen = rows.filter((r) => r.ok)

  const save = async () => {
    setBusy(true)
    for (const r of chosen) {
      const src = await store!.saveSource({ kind: 'upload', fileName: state?.fileName, page: r.page ?? undefined, lineText: r.lineText, confidence: r.confidence })
      await store!.saveDebt({
        lender: r.lender, type: r.type, label: t(`type.${r.type}` as const), balance: r.balance, ratePct: r.ratePct,
        minPayment: r.minPayment ?? 0, dueDay: r.dueDay, termMonthsLeft: r.termMonthsLeft, status: 'verified', sourceId: src.id,
      })
    }
    await refresh()
    nav('/', { state: { justAdded: chosen.length } })
  }

  if (!rows.length) {
    return (<>
      <h1 className="h1">{t('review.title')}</h1>
      <p className="muted">{t('review.none')}</p>
      <button className="btn btn-secondary" onClick={() => nav('/debt/add')}>{t('common.back')}</button>
    </>)
  }
  return (
    <>
      <h1 className="h1">{t('review.title')}</h1>
      <p className="muted">{t('review.line')}</p>
      {rows.map((r, i) => (
        <div key={i} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="h2">{r.lender}</span>
            <Badge status={r.confidence < 0.7 && !r.ok ? 'needs_review' : r.ok ? 'verified' : 'user_stated'} />
          </div>
          <span className="muted small">{t(`type.${r.type}` as const)}</span>
          <div className="field"><label>{t('debt.balance')}</label><NumInput value={r.balance} onChange={(v) => edit(i, { balance: v ?? 0 })} /></div>
          <div className="field"><label>{t('debt.rate')}</label><NumInput value={r.ratePct} onChange={(v) => edit(i, { ratePct: v })} /></div>
          <div className="field"><label>{t('debt.minPayment')}</label><NumInput value={r.minPayment} onChange={(v) => edit(i, { minPayment: v })} /></div>
          <div className="card card-dark">
            <span className="muted small">{t('review.sourceLine')}</span>
            <span className="small">{r.lineText || '-'}</span>
            <span className="muted small num">{t('review.confidence')}: {Math.round(r.confidence * 100)}%, {formatBaht(r.balance)}</span>
          </div>
          <label className="row" style={{ cursor: 'pointer' }}>
            <input type="checkbox" checked={r.ok} onChange={(e) => edit(i, { ok: e.target.checked })} style={{ width: 24, height: 24 }} />
            <span>{t('review.matches')}</span>
          </label>
        </div>
      ))}
      <button className="btn btn-primary" disabled={!chosen.length || busy} onClick={save}>{t('review.saveChecked')}</button>
    </>
  )
}
