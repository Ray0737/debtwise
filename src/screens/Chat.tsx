import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { summarize } from '../lib/derive'
import { oneOffTotal, useApp } from '../store/useApp'
import { Page } from '../ui'
import { Consultant } from './Consultant'

// The first line of the conversation comes from the engine numbers, never from the AI.
export default function Chat() {
  const t = useT()
  const { profile, debts, oneOffs } = useApp()
  const justAdded = (useLocation().state as { justAdded?: number } | null)?.justAdded ?? 0
  if (!profile) return null
  const s = summarize(profile, debts, oneOffTotal(oneOffs))
  const [monthly] = useState(() => {
    const month = new Date().toISOString().slice(0, 7)
    try {
      const hit = localStorage.getItem('dw-monthly-notice') === month
      if (hit) localStorage.removeItem('dw-monthly-notice')
      return hit
    } catch { return false }
  })
  const status = s.plan.shortfall > 0
    ? t('home.notice.short', { amount: formatBaht(s.plan.shortfall) })
    : t('home.notice.ok', { amount: formatBaht(s.plan.leftover) })
  const lead = justAdded ? t('home.notice.added', { n: justAdded }) : monthly ? t('home.notice.month') : ''
  const notice = debts.length === 0 ? t('home.notice.empty') : [lead, status].filter(Boolean).join(' ')
  return (
    <Page icon="chat-dots" title={t('talk.title')} compact>
      <Consultant notice={notice} />
    </Page>
  )
}
