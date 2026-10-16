import { useEffect, useState } from 'react'
import { formatBaht, formatDate } from '../engine'
import { TOKEN_EVENTS } from '../data/sample/tokenomist'
import { useT } from '../i18n'
import { summarize } from '../lib/derive'
import { fetchMarket, type MarketData } from '../lib/market'
import { oneOffTotal, useApp } from '../store/useApp'
import { Icon, Page, Row, SampleTag, Sparkline } from '../ui'
import { SpareCash } from './SpareCash'
import { lockedPct } from '../../api/_lib/market'

const KIND_ICON = { unlock: 'unlock', vesting: 'hourglass-split', emission: 'droplet' } as const

export default function Invest() {
  const t = useT()
  const { profile, debts, lang, oneOffs } = useApp()
  const [market, setMarket] = useState<MarketData | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => { fetchMarket().then(setMarket).catch(() => setFailed(true)) }, [])

  const left = profile ? Math.max(0, summarize(profile, debts, oneOffTotal(oneOffs)).plan.leftover) : 0
  const events = [...TOKEN_EVENTS].sort((a, b) => a.date.localeCompare(b.date))
  const row = (e: (typeof events)[number]) => (
    <Row key={e.id} icon={KIND_ICON[e.kind]} title={`${e.token} · ${t(`invest.kind.${e.kind}` as const)}`}
      sub={`${formatDate(e.date, lang)} · ${e.shareOfSupplyPct}% ${t('invest.share')}`} value={e.amountTokens.toLocaleString('en-US')} />
  )
  const time = market ? new Date(market.updatedAt).toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
  return (
    <Page
      icon="graph-up-arrow"
      title={t('nav.invest')}
      desc={t('desc.invest')}
      hero={<><span className="small">{t('invest.title')}</span><span className="small"><span className="badge out"><Icon n="broadcast" />{t('invest.live')}</span></span></>}
    >
      <p className="small"><Icon n="info-circle" /> {t('invest.context', { amount: formatBaht(left) })}</p>

      <div className="stack">
        <h2>{t('invest.market')}</h2>
        <p className="small muted">{t('invest.marketLine')}</p>
        {failed && <p className="err" role="status">{t('invest.marketErr')}</p>}
        {!market && !failed && <p className="muted">{t('common.loading')}</p>}
        {market && (
          <div className="strip" aria-label={t('invest.market')}>
            {market.coins.filter((c) => c.spark.length > 1).map((c) => (
              <div key={c.id} className="tick">
                <span className="small strong">{c.symbol}</span>
                <span className={`small ${(c.change24h ?? 0) >= 0 ? 'upc' : 'downc'}`}>{c.change24h === null ? '' : `${c.change24h >= 0 ? '▲' : '▼'} ${Math.abs(c.change24h).toFixed(2)}%`}</span>
                <Sparkline points={c.spark} label={`${c.name} ${t('invest.sevenDays')}`} />
                <span className="num small">{formatBaht(c.priceThb)}</span>
              </div>
            ))}
          </div>
        )}
        {market && (
          <div className="card">
            <div className="list">
              {market.coins.map((c) => {
                const locked = lockedPct(c)
                const ch = c.change24h
                return (
                  <Row key={c.id} icon="coin" title={`${c.name} (${c.symbol})`}
                    sub={`${ch === null ? '' : `${ch >= 0 ? '+' : ''}${ch.toFixed(1)}% 24h`}${locked === null ? '' : ` · ${t('invest.locked', { pct: locked })}`}`}
                    value={formatBaht(c.priceThb)}>
                    {locked !== null && <div className="bar" style={{ marginTop: 6 }} aria-hidden="true"><i style={{ width: `${locked}%` }} /></div>}
                  </Row>
                )
              })}
            </div>
          </div>
        )}
        {market && <p className="small muted">{t('invest.updated', { time })} · <a className="link" href="https://www.coingecko.com/" target="_blank" rel="noreferrer">CoinGecko</a></p>}
      </div>

      <SpareCash />

      <div className="stack">
        <div className="between"><h2>{t('invest.unlockSample')}</h2><SampleTag /></div>
        <div className="card"><div className="list">{events.map(row)}</div></div>
      </div>
      <p className="small muted">{t('invest.disclaimer')}</p>
    </Page>
  )
}
