import { useState } from 'react'
import { OFFERS } from '../data/sample/offers'
import { allowanceTotal, formatBaht, refinance, type Debt } from '../engine'
import { useT } from '../i18n'
import { summarize } from '../lib/derive'
import { buildLenderMessage } from '../lib/lenderMessage'
import { oneOffTotal, useApp } from '../store/useApp'
import { Card, Icon, Modal, Page, Row, SampleTag } from '../ui'

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
  const { profile, debts, store, oneOffs, taxAnswers } = useApp()
  const [saved, setSaved] = useState(false)
  const [draft, setDraft] = useState(false)
  const [copied, setCopied] = useState(false)
  const { lang } = useApp()
  if (!profile) return null
  const s = summarize(profile, debts, oneOffTotal(oneOffs), allowanceTotal(taxAnswers))
  const byId = new Map(debts.map((d) => [d.id, d]))
  const atRisk = s.plan.shortfall > 0
    ? byId.get(s.plan.allocations.find((a) => a.reason === 'unpaid' || a.reason === 'partial_minimum')?.debtId ?? '') ?? [...debts].sort((a, b) => b.minPayment - a.minPayment)[0]
    : undefined
  const message = atRisk ? buildLenderMessage({ lang, name: profile.displayName, debt: atRisk, available: s.cash.available, minimums: s.minimums, shortfall: s.plan.shortfall }) : ''
  const copy = async () => { try { await navigator.clipboard.writeText(message); setCopied(true) } catch { /* clipboard may be blocked */ } }
  const hasRefi = debts.some((d) => d.ratePct != null && d.termMonthsLeft && OFFERS.some((o) => o.forTypes.includes(d.type)))

  const save = async () => {
    await store!.savePlan(new Date().toISOString().slice(0, 7), { available: s.cash.available, minimums: s.minimums, taxSetAside: s.taxSetAside }, s.plan)
    setSaved(true)
  }

  return (
    <Page
      title={t('plan.title')}
      desc={t('desc.plan')}
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
      {atRisk && (
        <Card title={t('plan.lenderTitle')} icon="envelope-paper">
          <p className="muted">{t('plan.lenderLine')}</p>
          <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => { setDraft(true); setCopied(false) }}><Icon n="pencil-square" />{t('plan.lenderBtn')}</button>
        </Card>
      )}
      {draft && atRisk && (
        <Modal title={t('plan.lenderTitle')} onClose={() => setDraft(false)}>
          <div className="stack">
            <textarea className="input msgbox" readOnly rows={12} value={message} aria-label={t('plan.lenderTitle')} />
            <div className="between">
              <span className="small" role="status">{copied && <><Icon n="check-circle" /> {t('plan.copied')}</>}</span>
              <button className="btn" onClick={copy}><Icon n="clipboard" />{t('plan.copy')}</button>
            </div>
          </div>
        </Modal>
      )}
      <h2>{t('refi.title')}</h2>
      <p className="small muted">{t('refi.line')}</p>
      {debts.map((d) => <Refi key={d.id} debt={d} />)}
      {!hasRefi && <p className="muted">{t('refi.none')}</p>}
    </Page>
  )
}
