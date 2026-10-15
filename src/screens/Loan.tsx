import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import type { Source } from '../store/types'
import { useApp } from '../store/useApp'
import { Badge, Card, Icon, Modal, Page } from '../ui'
import { DebtForm } from './DebtForm'

export default function Loan() {
  const t = useT()
  const nav = useNavigate()
  const { id } = useParams()
  const { debts, store, refresh } = useApp()
  const d = debts.find((x) => x.id === id)
  const [source, setSource] = useState<Source | null>(null)
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(false)

  useEffect(() => {
    if (!store || !d?.sourceId) { setSource(null); return }
    void store.getSources([d.sourceId]).then((r) => setSource(r[0] ?? null))
  }, [store, d?.sourceId])

  if (!d) return <Navigate to="/debt" replace />
  const srcText = !source ? t('debt.sourceNone') : source.kind === 'sample' ? t('debt.sourceSample') : source.kind === 'upload' ? source.fileName ?? t('add.upload') : t('debt.sourceYou')
  const rows: [string, string][] = [
    [t('debt.lender'), d.lender],
    [t('debt.type'), t(`type.${d.type}` as const)],
    [t('debt.rate'), d.ratePct == null ? '-' : `${d.ratePct}%`],
    [t('debt.minPayment'), formatBaht(d.minPayment)],
    [t('debt.dueDay'), d.dueDay ? String(d.dueDay) : '-'],
    [t('debt.termLeft'), d.termMonthsLeft ? String(d.termMonthsLeft) : '-'],
  ]

  return (
    <Page
      title={d.label}
      back="/debt"
      hero={<><span className="small">{t('debt.balance')}</span><span className="big num">{formatBaht(d.balance)}</span></>}
    >
      {editing ? (
        <Card title={t('common.edit')} icon="pencil">
          <DebtForm initial={d} onCancel={() => setEditing(false)} onSave={async (v) => { await store!.saveDebt({ ...v, id: d.id }); await refresh(); setEditing(false) }} />
        </Card>
      ) : (
        <>
          <Card title={t('loan.details')} icon="info-circle">
            {rows.map(([k, v]) => <div className="kv" key={k}><span className="muted">{k}</span><span className="num strong">{v}</span></div>)}
          </Card>
          <Card title={t('debt.source')} icon="file-earmark-text">
            <div className="between"><span className="strong">{srcText}</span><Badge status={source?.kind === 'sample' ? 'sample' : d.status} /></div>
            {source?.lineText && <p className="small muted">“{source.lineText}”</p>}
          </Card>
          <div className="between">
            <button className="btn danger" onClick={() => setConfirm(true)}><Icon n="trash3" />{t('common.delete')}</button>
            <button className="btn" onClick={() => setEditing(true)}><Icon n="pencil" />{t('common.edit')}</button>
          </div>
        </>
      )}
      {confirm && (
        <Modal title={t('common.delete')} tone="danger" onClose={() => setConfirm(false)}>
          <div className="stack">
            <p>{t('loan.deleteConfirm')}</p>
            <div className="btnrow">
              <button className="btn soft block" onClick={() => setConfirm(false)}>{t('common.cancel')}</button>
              <button className="btn danger block" onClick={async () => { await store!.deleteDebt(d.id); await refresh(); nav('/debt', { replace: true }) }}>{t('common.delete')}</button>
            </div>
          </div>
        </Modal>
      )}
    </Page>
  )
}
