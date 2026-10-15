import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { daysUntilDue, summarize } from '../lib/derive'
import { buildIcs } from '../lib/ics'
import { oneOffTotal, useApp } from '../store/useApp'
import { Card, Icon, Page, Row } from '../ui'

export default function Home() {
  const t = useT()
  const nav = useNavigate()
  const { profile, debts, store, oneOffs, clearOneOffs } = useApp()
  const oneOff = oneOffTotal(oneOffs)
  const s = profile ? summarize(profile, debts, oneOff) : null
  const month = new Date().toISOString().slice(0, 7)

  useEffect(() => {
    if (!store || !s || debts.length === 0) return
    void store.hasPlan(month).then(async (has) => {
      if (has) return
      await store.savePlan(month, { available: s.cash.available, minimums: s.minimums, taxSetAside: s.taxSetAside }, s.plan)
      try { localStorage.setItem('dw-monthly-notice', month) } catch { /* storage may be blocked */ }
    })
  }, [store, debts.length, profile?.monthlyIncome, profile?.monthlyEssentials]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!profile || !s) return null
  const upcoming = debts
    .filter((d) => d.dueDay)
    .map((d) => ({ d, days: daysUntilDue(d.dueDay!) }))
    .sort((x, y) => x.days - y.days)
  const next = upcoming[0]

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
      icon="house"
      tall
      title={t('home.greeting', { name: profile.displayName || t('app.name') })}
      desc={t('desc.home')}
      hero={
        <>
          <span className="small">{short ? t('plan.shortfall') : t('home.left')} · {t('home.thisMonth')}</span>
          <span className="big num">{formatBaht(short ? s.plan.shortfall : s.plan.leftover)}</span>
          {next && (
            <span className="chip">
              <Icon n="calendar-event" /> {t('home.nextDue')}: {next.d.label} · {formatBaht(next.d.minPayment)} · {next.days === 0 ? t('home.dueToday') : t('home.dueIn', { n: next.days })}
            </span>
          )}
          <button className="btn light" onClick={() => nav('/chat')}><Icon n="chat-dots" />{t('home.ask')}</button>
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
      {upcoming.length > 0 && (
        <div className="stack">
          <h2>{t('home.upcoming')}</h2>
          <div className="card">
            <div className="list">
              {upcoming.slice(0, 5).map(({ d, days }) => (
                <Row key={d.id} icon="calendar-event" title={`${d.label} · ${d.lender}`} sub={t('home.dueIn', { n: days })} value={formatBaht(d.minPayment)} to={`/debt/loan/${d.id}`} />
              ))}
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}
