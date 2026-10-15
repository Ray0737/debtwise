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

  return (
    <>
      <div className="card card-dark">
        <span className="muted">{t('home.thisMonth')}</span>
        <span className="display accent num">
          {s.plan.shortfall > 0 ? `${t('plan.shortfall')} ${formatBaht(s.plan.shortfall)}` : formatBaht(s.plan.leftover)}
        </span>
        {next && (
          <span className="muted small">
            {t('home.nextDue')}: {next.d.label}, <span className="num">{formatBaht(next.d.minPayment)}</span>, {t('home.dueIn', { n: next.days })}
          </span>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => nav('/plan')}>{t('home.openPlan')}</button>
          <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => nav('/debt/add')}><Icon name="plus" size={20} />{t('debt.add')}</button>
          {debts.some((d) => d.dueDay) && <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={downloadIcs}>{t('home.calendar')}</button>}
        </div>
      </div>
      <Consultant notice={notice} />
    </>
  )
}
