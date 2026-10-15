import { useState } from 'react'
import { TOKEN_EVENTS, WATCHLIST } from '../data/sample/tokenomist'
import { formatBaht, formatDate } from '../engine'
import { useT } from '../i18n'
import { summarize } from '../lib/derive'
import { useApp } from '../store/useApp'

export default function Invest() {
  const t = useT()
  const { profile, debts, lang } = useApp()
  const [watch, setWatch] = useState<string[]>(WATCHLIST)
  const tokens = [...new Set(TOKEN_EVENTS.map((e) => e.token))]
  const events = TOKEN_EVENTS.filter((e) => watch.includes(e.token)).sort((a, b) => a.date.localeCompare(b.date))
  const left = profile ? Math.max(0, summarize(profile, debts).cash.leftAfterMinimums) : 0
  const toggle = (k: string) => setWatch((w) => (w.includes(k) ? w.filter((x) => x !== k) : [...w, k]))

  return (
    <>
      <h1 className="h1">{t('invest.title')}</h1>
      <div className="card card-dark">
        <span>{t('invest.context', { amount: formatBaht(left) })}</span>
        <span className="muted small">{t('invest.disclaimer')}</span>
      </div>
      <h2 className="h2">{t('invest.watchlist')}</h2>
      <div className="chips">
        {tokens.map((k) => <button key={k} className={`chip${watch.includes(k) ? ' on' : ''}`} aria-pressed={watch.includes(k)} onClick={() => toggle(k)}>{k}</button>)}
      </div>
      <h2 className="h2">{t('invest.upcoming')}</h2>
      <div className="joined">
        {events.map((e) => (
          <div key={e.id} className="row" style={{ cursor: 'default' }}>
            <div className="grow">
              <div>{e.token}, {t(`invest.kind.${e.kind}` as const)}</div>
              <div className="muted small">{formatDate(e.date, lang)}, {t('common.sample')} {e.asOf}</div>
            </div>
            <div className="val"><div className="num">{e.amountTokens.toLocaleString('en-US')}</div><div className="muted small num">{e.shareOfSupplyPct}% {t('invest.share')}</div></div>
          </div>
        ))}
      </div>
      <p className="muted small">{t('invest.disclaimer')}</p>
    </>
  )
}
