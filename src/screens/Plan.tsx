import { useState } from 'react'
import { OFFERS } from '../data/sample/offers'
import { formatBaht, refinance, type Debt } from '../engine'
import { useT } from '../i18n'
import { summarize } from '../lib/derive'
import { oneOffTotal, useApp } from '../store/useApp'
import { Card, Icon, Page, Row, SampleTag } from '../ui'

function Refi({ debt }: { debt: Debt }) {
  const t = useT()
  if (debt.ratePct == null || !debt.termMonthsLeft) return null
  const offers = OFFERS.filter((o) => o.forTypes.includes(debt.type))
  return (
    <>
      {offers.map((o) => {
        const r = refinance({ balance: debt.balance, currentRatePct: debt.ratePct!, termMonthsLeft: debt.termMonthsLeft!, offer: o })
        return (
          <Card key={o.id}>
            <div className="between">
              <span className="strong ell">{debt.label} · {o.bank}</span>
              <SampleTag />
            </div>
            <div className="kv"><span className="muted">{t('refi.payment')}</span><span className="num">{formatBaht(r.currentPayment)} → {formatBaht(r.newPayment)}</span></div>
            <div className="kv"><span className="muted">{t('refi.total')}</span><span className="num">{formatBaht(r.currentTotal)} → {formatBaht(r.newTotal)}</span></div>
            <p className="small muted">
              {t('refi.inputs')}: {t('refi.fee')} {formatBaht(o.fee)}, {t('refi.penalty')} {formatBaht(o.penalty)}, {t('refi.insurance')} {formatBaht(o.insuranceMonthly)}, {o.ratePct}%, {o.termMonths}
            </p>
            <div className="card line">
              <span className="strong num"><Icon n={r.worthIt ? 'arrow-down-circle' : 'arrow-up-circle'} /> {r.worthIt ? t('refi.saving') : t('refi.loss')}: {formatBaht(Math.abs(r.saving))}</span>
              <span>{r.worthIt ? t('refi.worth') : t('refi.notWorth')}</span>
              {r.longerTerm && <span className="small muted">{t('refi.longer')}</span>}
            </div>
          </Card>
        )
      })}
    </>
  )
}

export default function Plan() {
  const t = useT()
  const { profile, debts, store, oneOffs } = useApp()
  const [saved, setSaved] = useState(false)
  if (!profile) return null
  const s = summarize(profile, debts, oneOffTotal(oneOffs))
  const byId = new Map(debts.map((d) => [d.id, d]))
  const hasRefi = debts.some((d) => d.ratePct != null && d.termMonthsLeft && OFFERS.some((o) => o.forTypes.includes(d.type)))

  const save = async () => {
    await store!.savePlan(new Date().toISOString().slice(0, 7), { available: s.cash.available, minimums: s.minimums, taxSetAside: s.taxSetAside }, s.plan)
    setSaved(true)
  }

  return (
    <Page
      title={t('plan.title')}
      back
      hero={
        <>
          <span className="small">{t('plan.available')}</span>
          <span className="big num">{formatBaht(s.cash.available)}</span>
          <span className="small num">
            {t('plan.minimums')}: {formatBaht(s.minimums)} · {s.plan.shortfall > 0 ? `${t('plan.shortfall')} ${formatBaht(s.plan.shortfall)}` : `${t('plan.leftover')} ${formatBaht(s.plan.leftover)}`}
          </span>
        </>
      }
    >
      {s.essentialsMissing && <p className="small" role="status"><Icon n="info-circle" /> {t('plan.noEssentials')}</p>}
      {s.plan.shortfall > 0 && <p><Icon n="telephone" /> {t('plan.options')}</p>}
      <div className="card">
        <div className="list">
          {s.plan.allocations.map((a) => {
            const d = byId.get(a.debtId)
            return d ? <Row key={a.debtId} icon="cash-coin" title={`${d.label} · ${d.lender}`} sub={t(`plan.reason.${a.reason}` as const)} value={formatBaht(a.amount)} /> : null
          })}
        </div>
      </div>
      <div className="between">
        <span className="small" role="status">{saved && <><Icon n="check-circle" /> {t('plan.saved')}</>}</span>
        <button className="btn" onClick={save}><Icon n="bookmark-check" />{t('plan.save')}</button>
      </div>
      <h2>{t('refi.title')}</h2>
      <p className="small muted">{t('refi.line')}</p>
      {debts.map((d) => <Refi key={d.id} debt={d} />)}
      {!hasRefi && <p className="muted">{t('refi.none')}</p>}
    </Page>
  )
}
