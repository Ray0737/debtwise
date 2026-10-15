import { formatBaht, formatDate } from '../engine'
import { TOKEN_EVENTS, WATCHLIST } from '../data/sample/tokenomist'
import { useT } from '../i18n'
import { summarize } from '../lib/derive'
import { oneOffTotal, useApp } from '../store/useApp'
import { Icon, Page, Row, SampleTag } from '../ui'

const KIND_ICON = { unlock: 'unlock', vesting: 'hourglass-split', emission: 'droplet' } as const

export default function Invest() {
  const t = useT()
  const { profile, debts, lang, oneOffs } = useApp()
  const left = profile ? Math.max(0, summarize(profile, debts, oneOffTotal(oneOffs)).plan.leftover) : 0
  const events = [...TOKEN_EVENTS].sort((a, b) => a.date.localeCompare(b.date))
  const watched = events.filter((e) => WATCHLIST.includes(e.token))
  const row = (e: (typeof events)[number]) => (
    <Row key={e.id} icon={KIND_ICON[e.kind]} title={`${e.token} · ${t(`invest.kind.${e.kind}` as const)}`}
      sub={`${formatDate(e.date, lang)} · ${e.shareOfSupplyPct}% ${t('invest.share')}`} value={e.amountTokens.toLocaleString('en-US')} />
  )
  return (
    <Page
      icon="graph-up-arrow"
      title={t('nav.invest')}
      desc={t('desc.invest')}
      hero={<><span className="small">{t('invest.title')}</span><span className="small"><SampleTag /></span></>}
    >
      <p className="small"><Icon n="info-circle" /> {t('invest.context', { amount: formatBaht(left) })}</p>
      <div className="stack">
        <h2>{t('invest.watchlist')}</h2>
        <div className="card"><div className="list">{watched.map(row)}</div></div>
      </div>
      <div className="stack">
        <h2>{t('invest.upcoming')}</h2>
        <div className="card"><div className="list">{events.map(row)}</div></div>
      </div>
      <p className="small muted">{t('invest.disclaimer')} · {events[0]?.sourceLabel} {events[0]?.asOf}</p>
    </Page>
  )
}
