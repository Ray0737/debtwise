import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Consultant } from '../components/Consultant'
import { Icon } from '../components/Icon'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { daysUntilDue, summarize } from '../lib/derive'
import { buildIcs } from '../lib/ics'
import { useApp } from '../store/useApp'

export default function Home() {
  const t = useT()
  const nav = useNavigate()
  const { profile, debts, store } = useApp()
  const [monthly, setMonthly] = useState(false)
  const justAdded = (useLocation().state as { justAdded?: number } | null)?.justAdded ?? 0
  const s = profile ? summarize(profile, debts) : null
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
  const short = s.plan.shortfall > 0
  const paid = s.plan.allocations.reduce((x, a) => x + a.amount, 0)
  const income = (profile.monthlyIncome ?? 0) + profile.otherIncome
  const status = short
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

  return (
    <>
      <div className={`card ${short ? 'card-red' : 'card-dark'}`}>
        <span className="muted section-title"><Icon name={short ? 'warn' : 'check'} size={16} />{t('home.thisMonth')}</span>
        <span className={`display num${short ? '' : ' accent'}`}>
          {short ? `${t('plan.shortfall')} ${formatBaht(s.plan.shortfall)}` : formatBaht(s.plan.leftover)}
        </span>
        {next && (
          <span className="muted small section-title">
            <Icon name="calendar" size={14} />{t('home.nextDue')}: {next.d.label}, <b className="num">{formatBaht(next.d.minPayment)}</b>, {t('home.dueIn', { n: next.days })}
          </span>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="btn btn-sm btn-secondary" onClick={() => nav('/plan')}><Icon name="chart" size={14} />{t('home.openPlan')}</button>
          <button className="btn btn-sm btn-secondary" onClick={() => nav('/debt/add')}><Icon name="plus" size={14} />{t('debt.add')}</button>
          {debts.some((d) => d.dueDay) && <button className="btn btn-sm btn-secondary" onClick={downloadIcs}><Icon name="bell" size={14} />{t('home.calendar')}</button>}
        </div>
      </div>
      <div className="stats-row">
        <div className="stat-item"><span className="stat-value num">{formatBaht(income)}</span><span className="stat-label">{t('home.income')}</span></div>
        <div className="stat-item"><span className="stat-value num">{formatBaht(profile.monthlyEssentials ?? 0)}</span><span className="stat-label">{t('home.essentials')}</span></div>
        <div className="stat-item"><span className="stat-value num">{formatBaht(paid)}</span><span className="stat-label">{t('home.debts')}</span></div>
      </div>
      <Consultant notice={notice} />
    </>
  )
}
