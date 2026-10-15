import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon, IconTile } from '../components/Icon'
import { StackedBar } from '../components/StackedBar'
import { formatBaht, type DebtType } from '../engine'
import { useT } from '../i18n'
import { TYPE_ICON, groupDebts } from '../lib/group'
import { useApp } from '../store/useApp'

export default function Debt() {
  const t = useT()
  const nav = useNavigate()
  const debts = useApp((s) => s.debts)
  const [by, setBy] = useState<'bank' | 'type'>('bank')
  const total = debts.reduce((s, d) => s + d.balance, 0)
  const monthly = debts.reduce((s, d) => s + d.minPayment, 0)
  const groups = groupDebts(debts, by)

  return (
    <>
      <div className="card card-red">
        <span className="muted section-title"><Icon name="wallet" size={16} />{t('debt.totalOwed')}</span>
        <span className="display num">{formatBaht(total)}</span>
        <span className="muted small">{t('debt.monthlyTotal')}: <b className="num">{formatBaht(monthly)}</b></span>
      </div>
      <div className="chips">
        <button className={`chip${by === 'bank' ? ' on' : ''}`} onClick={() => setBy('bank')}><Icon name="bank" size={14} />{t('debt.byBank')}</button>
        <button className={`chip${by === 'type' ? ' on' : ''}`} onClick={() => setBy('type')}><Icon name="tag" size={14} />{t('debt.byType')}</button>
      </div>
      {groups.length === 0 && <p className="muted">{t('debt.empty')}</p>}
      <div className="grid2">
        {groups.map((g) => (
          <div key={g.key} className="card row" role="link" tabIndex={0}
            onClick={() => nav(`/debt/group/${by}/${encodeURIComponent(g.key)}`)}
            onKeyDown={(e) => e.key === 'Enter' && nav(`/debt/group/${by}/${encodeURIComponent(g.key)}`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <IconTile name={by === 'type' ? TYPE_ICON[g.key as DebtType] : 'bank'} />
              <span className="h2" style={{ flex: 1 }}>{by === 'type' ? t(`type.${g.key}` as never) : g.key}</span>
              <span className="num strong">{formatBaht(g.total)}</span>
            </div>
            <StackedBar byType={g.byType} total={g.total} />
            <span className="muted small num">{total ? Math.round((g.total / total) * 100) : 0}% {t('debt.share')}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={() => nav('/debt/add')}><Icon name="plus" size={16} />{t('debt.add')}</button>
      <button className="btn btn-secondary" onClick={() => nav('/plan')}><Icon name="chart" size={16} />{t('home.openPlan')}</button>
    </>
  )
}
