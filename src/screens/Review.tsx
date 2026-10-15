import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import type { Candidate } from '../lib/ai'
import { useApp } from '../store/useApp'
import { Badge, Card, Field, Icon, NumInput, Page } from '../ui'

export default function Review() {
  const t = useT()
  const nav = useNavigate()
  const { store, refresh } = useApp()
  const state = useLocation().state as { candidates?: Candidate[]; fileName?: string } | null
  const [rows, setRows] = useState((state?.candidates ?? []).map((c) => ({ ...c, ok: false })))
  const [busy, setBusy] = useState(false)
  if (!state) return <Navigate to="/debt/add" replace />
  const edit = (i: number, patch: Partial<Candidate & { ok: boolean }>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)))
  const chosen = rows.filter((r) => r.ok)

  const save = async () => {
    setBusy(true)
    try {
      for (const r of chosen) {
        const src = await store!.saveSource({ kind: 'upload', fileName: state.fileName, page: r.page ?? undefined, lineText: r.lineText, confidence: r.confidence })
        await store!.saveDebt({
          lender: r.lender, type: r.type, label: t(`type.${r.type}` as const), balance: r.balance, ratePct: r.ratePct,
          minPayment: r.minPayment ?? 0, dueDay: r.dueDay, termMonthsLeft: r.termMonthsLeft, status: 'verified', sourceId: src.id,
        })
      }
      await refresh()
      nav('/chat', { state: { justAdded: chosen.length } })
    } finally { setBusy(false) }
  }

  return (
    <Page title={t('review.title')} desc={t('desc.review')} back="/debt/add" hero={<span className="small">{rows.length ? t('review.line') : ''}</span>}>
      {!rows.length && <Card><p className="muted">{t('review.none')}</p></Card>}
      {rows.map((r, i) => (
        <Card key={i}>
          <div className="between">
            <span className="strong">{r.lender}</span>
            <Badge status={r.ok ? 'verified' : r.confidence < 0.7 ? 'needs_review' : 'user_stated'} />
          </div>
          <span className="small muted">{t(`type.${r.type}` as const)}</span>
          <Field label={t('debt.balance')}><NumInput value={r.balance} onChange={(v) => edit(i, { balance: v ?? 0 })} /></Field>
          <Field label={t('debt.rate')}><NumInput value={r.ratePct} onChange={(v) => edit(i, { ratePct: v })} /></Field>
          <Field label={t('debt.minPayment')}><NumInput value={r.minPayment} onChange={(v) => edit(i, { minPayment: v })} /></Field>
          <div className="card line">
            <span className="card-title"><Icon n="quote" />{t('review.sourceLine')}</span>
            <span className="small">{r.lineText || '-'}</span>
            <span className="small muted num">{t('review.confidence')}: {Math.round(r.confidence * 100)}% · {formatBaht(r.balance)}</span>
          </div>
          <label className="check"><input type="checkbox" checked={r.ok} onChange={(e) => edit(i, { ok: e.target.checked })} />{t('review.matches')}</label>
        </Card>
      ))}
      <button className="btn block" disabled={!chosen.length || busy} onClick={save}><Icon n="check2-all" />{t('review.saveChecked')}</button>
    </Page>
  )
}
