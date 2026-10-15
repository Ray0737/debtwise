import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { DebtForm } from '../components/DebtForm'
import { Sheet } from '../components/Sheet'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
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
  return (
    <>
      <button className="btn btn-text" style={{ alignSelf: 'flex-start' }} onClick={() => nav(-1)}>{t('common.back')}</button>
      <div className="card card-dark">
        <span className="muted">{d.lender}</span>
        <span className="h1">{d.label}</span>
        <span className="display accent num">{formatBaht(d.balance)}</span>
        <Badge status={d.status} />
      </div>
      <div className="joined">
        <div className="row"><span className="grow">{t('debt.rate')}</span><span className="num">{d.ratePct ?? '-'}</span></div>
        <div className="row"><span className="grow">{t('debt.minPayment')}</span><span className="num">{formatBaht(d.minPayment)}</span></div>
        <div className="row"><span className="grow">{t('debt.dueDay')}</span><span className="num">{d.dueDay ?? '-'}</span></div>
        <div className="row"><span className="grow">{t('debt.termLeft')}</span><span className="num">{d.termMonthsLeft ?? '-'}</span></div>
        <div className="row"><span className="grow">{t('debt.source')}</span><span className="small">{sourceText}</span></div>
      </div>
      <button className="btn btn-secondary" onClick={() => setEdit(true)}>{t('common.save')}</button>
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
