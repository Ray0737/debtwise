import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { daysUntilDue, summarize } from '../lib/derive'
import { buildIcs } from '../lib/ics'
import { oneOffTotal, useApp } from '../store/useApp'
import { Card, Icon, Page } from '../ui'
import { Consultant } from './Consultant'

export default function Home() {
  const t = useT()
  const nav = useNavigate()
  const { profile, debts, store, oneOffs, clearOneOffs } = useApp()
  const oneOff = oneOffTotal(oneOffs)
  const [monthly, setMonthly] = useState(false)
  const justAdded = (useLocation().state as { justAdded?: number } | null)?.justAdded ?? 0
  const s = profile ? summarize(profile, debts, oneOff) : null
  const month = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    if (!store || !s || debts.length === 0) return
    void store.hasPlan(month).then(async (has) => {
      if (has) return
      await store.savePlan(month, { available: s.cash.available, minimums: s.minimums, taxSetAside: s.taxSetAside }, s.plan)
      setMonthly(true)
    })
  }, [store, debts.length, profile?.monthlyIncome, profile?.monthlyEssentials]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!profile || !s) return null
  const next = debts
    .filter((d) => d.dueDay)
    .map((d) => ({ d, days: daysUntilDue(d.dueDay!) }))
    .sort((a, b) => a.days - b.days)[0]
  const status = s.plan.shortfall > 0
    ? t('home.notice.short', { amount: formatBaht(s.plan.shortfall) })
    : t('home.notice.ok', { amount: formatBaht(s.plan.leftover) })
  const lead = justAdded ? t('home.notice.added', { n: justAdded }) : monthly ? t('home.notice.month') : ''
  const notice = debts.length === 0 ? t('home.notice.empty') : [lead, status].filter(Boolean).join(' ')

  const downloadIcs = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([buildIcs(debts)], { type: 'text/calendar' }))
    a.download = 'debtwise-due-dates.ics'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const short = s.plan.shortfall > 0
  const lines: [string, string, number][] = [
    ['cash-stack', t('home.income'), (profile.monthlyIncome ?? 0) + profile.otherIncome],
    ['house-door', t('home.essentials'), profile.monthlyEssentials ?? 0],
    ...(oneOff > 0 ? ([['receipt-cutoff', t('home.oneOff'), oneOff]] as [string, string, number][]) : []),
    ['credit-card', t('home.debts'), s.minimums],
    ['receipt', t('home.tax'), s.taxSetAside],
  ]

  return (
    <Page
      title={t('home.greeting', { name: profile.displayName || t('app.name') })}
      hero={
        <>
          <span className="small">{short ? t('plan.shortfall') : t('home.left')} · {t('home.thisMonth')}</span>
          <span className="big num">{formatBaht(short ? s.plan.shortfall : s.plan.leftover)}</span>
          {next && (
            <span className="small">
              <Icon n="calendar-event" /> {t('home.nextDue')}: {next.d.label}, {formatBaht(next.d.minPayment)}, {t('home.dueIn', { n: next.days })}
            </span>
          )}
          <button className="btn light" onClick={() => { const i = document.getElementById('chat-input'); i?.scrollIntoView({ behavior: 'smooth', block: 'center' }); i?.focus({ preventScroll: true }) }}>
            <Icon n="chat-dots" />{t('home.ask')}
          </button>
        </>
      }
    >
      <Card>
        {lines.map(([icon, label, v]) => (
          <div className="kv" key={label}>
            <span className="muted"><Icon n={icon} /> {label}</span>
            <span className="num strong">{formatBaht(v)}</span>
          </div>
        ))}
        <div className="wrap">
          <button className="btn" onClick={() => nav('/plan')}><Icon n="list-check" />{t('home.openPlan')}</button>
          {oneOff > 0 && <button className="btn soft" onClick={clearOneOffs}><Icon n="x-lg" />{t('home.clearOneOff')}</button>}
          <button className="btn soft" onClick={() => nav('/debt/add')}><Icon n="plus-lg" />{t('debt.add')}</button>
          {debts.some((d) => d.dueDay) && <button className="btn soft" onClick={downloadIcs}><Icon n="calendar-plus" />{t('home.calendar')}</button>}
        </div>
      </Card>
      <Consultant notice={notice} />
    </Page>
  )
}
