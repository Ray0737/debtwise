import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatBaht, type DebtType } from '../engine'
import { useT } from '../i18n'
import { bankColor } from '../lib/bank'
import { groupDebts } from '../lib/group'
import { useApp } from '../store/useApp'
import { Icon, Page, Row, Seg } from '../ui'
import { TYPE_ICON } from './DebtForm'

export default function Debt() {
  const t = useT()
  const nav = useNavigate()
  const debts = useApp((s) => s.debts)
  const [by, setBy] = useState<'bank' | 'type'>('bank')
  const total = debts.reduce((s, d) => s + d.balance, 0)
  const monthly = debts.reduce((s, d) => s + d.minPayment, 0)
  const groups = groupDebts(debts, by)

  return (
    <Page
      icon="credit-card-2-front"
      title={t('nav.debt')}
      desc={t('desc.debt')}
      action={<button className="circle" aria-label={t('debt.add')} onClick={() => nav('/debt/add')}><Icon n="plus-lg" /></button>}
      hero={
        <>
          <span className="small">{t('debt.totalOwed')}</span>
          <span className="big num">{formatBaht(total)}</span>
          <span className="small">{t('debt.monthlyTotal')}: {formatBaht(monthly)}</span>
        </>
      }
    >
      <Seg value={by} onChange={setBy} options={[{ v: 'bank', label: t('debt.byBank') }, { v: 'type', label: t('debt.byType') }]} />
      {debts.length === 0 ? (
        <div className="card">
          <p className="muted">{t('debt.empty')}</p>
          <button className="btn" onClick={() => nav('/debt/add')}><Icon n="plus-lg" />{t('debt.add')}</button>
        </div>
      ) : (
        <div className="card">
          <div className="list">
            {groups.map((g) => (
              <Row
                key={g.key}
                iconStyle={by === 'bank' ? bankColor(g.key) : null}
                icon={by === 'bank' ? 'bank' : TYPE_ICON[g.key as DebtType]}
                title={by === 'bank' ? g.key : t(`type.${g.key as DebtType}` as const)}
                sub={`${t('debt.loans', { n: g.debts.length })} · ${total ? Math.round((g.total / total) * 100) : 0}% ${t('debt.share')}`}
                value={formatBaht(g.total)}
                to={`/debt/group/${by}/${encodeURIComponent(g.key)}`}
              />
            ))}
          </div>
        </div>
      )}
    </Page>
  )
}
