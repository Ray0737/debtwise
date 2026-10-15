import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, IconTile } from '../components/Icon'
import { OFFERS } from '../data/sample/offers'
import { formatBaht, refinance, type Debt } from '../engine'
import { useT } from '../i18n'
import { summarize } from '../lib/derive'
import { TYPE_ICON } from '../lib/group'
import { useApp } from '../store/useApp'

function Refi({ debt }: { debt: Debt }) {
  const t = useT()
  if (debt.ratePct == null || !debt.termMonthsLeft) return null
  const offers = OFFERS.filter((o) => o.forTypes.includes(debt.type))
  if (!offers.length) return null
  return (
    <>
      {offers.map((o) => {
        const r = refinance({ balance: debt.balance, currentRatePct: debt.ratePct!, termMonthsLeft: debt.termMonthsLeft!, offer: o })
        return (
          <div key={o.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{debt.label}, {o.bank}</span><span className="muted small">{t('common.sample')} {o.asOf}</span>
            </div>
            <div className="joined">
              <div className="row"><span className="grow">{t('refi.payment')}</span><span className="num muted">{formatBaht(r.currentPayment)}</span><span className="num">{formatBaht(r.newPayment)}</span></div>
              <div className="row"><span className="grow">{t('refi.total')}</span><span className="num muted">{formatBaht(r.currentTotal)}</span><span className="num">{formatBaht(r.newTotal)}</span></div>
            </div>
            <div className="muted small">{t('refi.inputs')}: {t('refi.fee')} {formatBaht(o.fee)}, {t('refi.penalty')} {formatBaht(o.penalty)}, {t('refi.insurance')} {formatBaht(o.insuranceMonthly)}, {o.ratePct}%, {o.termMonths}</div>
            <div className={r.worthIt ? '' : 'warn'}>
              <span className="h2 num">{r.worthIt ? t('refi.saving') : t('refi.loss')}: {formatBaht(Math.abs(r.saving))}</span>
              <div>{r.worthIt ? t('refi.worth') : t('refi.notWorth')}</div>
              {r.longerTerm && <div>{t('refi.longer')}</div>}
            </div>
          </div>
        )
      })}
    </>
  )
}

export default function Plan() {
  const t = useT()
  const nav = useNavigate()
  const { profile, debts, store } = useApp()
  const [saved, setSaved] = useState(false)
  if (!profile) return null
  const s = summarize(profile, debts)
  const byId = new Map(debts.map((d) => [d.id, d]))

  const save = async () => {
    const month = new Date().toISOString().slice(0, 7)
    await store!.savePlan(month, { available: s.cash.available, minimums: s.minimums, taxSetAside: s.taxSetAside }, s.plan)
    setSaved(true)
  }

  return (
    <>
      <button className="btn btn-text" style={{ alignSelf: 'flex-start' }} onClick={() => nav(-1)}><Icon name="back" size={14} />{t('common.back')}</button>
      <h1 className="h1">{t('plan.title')}</h1>
      <div className={`card ${s.plan.shortfall > 0 ? 'card-red' : 'card-dark'}`}>
        <span className="muted">{t('plan.available')}</span>
        <span className={`display num${s.plan.shortfall > 0 ? '' : ' accent'}`}>{formatBaht(s.cash.available)}</span>
        <span className="muted num">{t('plan.minimums')}: {formatBaht(s.minimums)}</span>
        {s.plan.shortfall > 0
          ? <span className="num">{t('plan.shortfall')}: {formatBaht(s.plan.shortfall)}</span>
          : <span className="num">{t('plan.leftover')}: {formatBaht(s.plan.leftover)}</span>}
      </div>
      {s.essentialsMissing && <p className="err" role="status">{t('plan.noEssentials')}</p>}
      {s.plan.shortfall > 0 && <p>{t('plan.options')}</p>}
      <div className="joined">
        {s.plan.allocations.map((a) => {
          const d = byId.get(a.debtId)
          if (!d) return null
          return (
            <div key={a.debtId} className="row" style={{ cursor: 'default' }}>
              <IconTile name={TYPE_ICON[d.type]} />
              <div className="grow"><div className="strong">{d.label}, {d.lender}</div><div className={`small ${a.reason === 'unpaid' || a.reason === 'partial_minimum' ? 'warn' : 'muted'}`}>{t(`plan.reason.${a.reason}` as const)}</div></div>
              <div className="val num">{formatBaht(a.amount)}</div>
            </div>
          )
        })}
      </div>
      <button className="btn btn-primary" onClick={save}><Icon name="check" size={16} />{t('plan.save')}</button>
      {saved && <p role="status">{t('plan.saved')}</p>}
      <h2 className="h2">{t('refi.title')}</h2>
      <p className="muted">{t('refi.line')}</p>
      {debts.map((d) => <Refi key={d.id} debt={d} />)}
      {!debts.some((d) => d.ratePct != null && d.termMonthsLeft && OFFERS.some((o) => o.forTypes.includes(d.type))) && <p className="muted">{t('refi.none')}</p>}
    </>
  )
}
