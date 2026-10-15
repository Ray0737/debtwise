import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { DebtForm } from '../components/DebtForm'
import { Icon, IconTile } from '../components/Icon'
import { Sheet } from '../components/Sheet'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { TYPE_ICON } from '../lib/group'
import { useApp } from '../store/useApp'
import type { Source } from '../store/types'

export default function LoanDetail() {
  const t = useT()
  const nav = useNavigate()
  const { id } = useParams()
  const { debts, store, refresh } = useApp()
  const d = debts.find((x) => x.id === id)
  const [src, setSrc] = useState<Source | null>(null)
  const [edit, setEdit] = useState(false)
  useEffect(() => {
    if (d?.sourceId && store) void store.getSources([d.sourceId]).then((s) => setSrc(s[0] ?? null))
  }, [d?.sourceId, store])
  if (!d) return <button className="btn btn-text" onClick={() => nav('/debt')}>{t('common.back')}</button>

  const sourceText = !d.sourceId ? t('debt.sourceYou') : src?.kind === 'sample' ? t('debt.sourceSample') : src?.lineText ? `${src.fileName ?? ''} ${src.lineText}` : t('debt.sourceNone')
  const rows: [string, string, string][] = [
    ['percent', t('debt.rate'), d.ratePct == null ? '-' : String(d.ratePct)],
    ['coins', t('debt.minPayment'), formatBaht(d.minPayment)],
    ['calendar', t('debt.dueDay'), d.dueDay == null ? '-' : String(d.dueDay)],
    ['clock', t('debt.termLeft'), d.termMonthsLeft == null ? '-' : String(d.termMonthsLeft)],
  ]
  return (
    <>
      <button className="btn btn-text" style={{ alignSelf: 'flex-start' }} onClick={() => nav(-1)}><Icon name="back" size={14} />{t('common.back')}</button>
      <div className="card card-dark">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconTile name={TYPE_ICON[d.type]} />
          <div><div className="muted small">{d.lender}</div><div className="h2">{d.label}</div></div>
        </div>
        <span className="display accent num">{formatBaht(d.balance)}</span>
        <Badge status={d.status} />
      </div>
      <div className="joined">
        {rows.map(([icon, label, value]) => (
          <div key={label} className="row" style={{ cursor: 'default' }}><IconTile name={icon} /><span className="grow">{label}</span><span className="num strong">{value}</span></div>
        ))}
        <div className="row" style={{ cursor: 'default' }}><IconTile name="doc" /><span className="grow">{t('debt.source')}</span><span className="small" style={{ textAlign: 'right' }}>{sourceText}</span></div>
      </div>
      <button className="btn btn-secondary" onClick={() => setEdit(true)}><Icon name="edit" size={16} />{t('common.save')}</button>
      <button className="btn btn-danger" onClick={async () => { await store!.deleteDebt(d.id); await refresh(); nav('/debt') }}>{t('common.delete')}</button>
      {edit && (
        <Sheet onClose={() => setEdit(false)}>
          <DebtForm initial={d} onCancel={() => setEdit(false)} onSave={async (x) => {
            await store!.saveDebt({ ...x, id: d.id, status: 'user_stated' })
            await refresh(); setEdit(false)
          }} />
        </Sheet>
      )}
    </>
  )
}
