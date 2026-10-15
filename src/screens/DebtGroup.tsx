import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { Icon, IconTile } from '../components/Icon'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { TYPE_ICON } from '../lib/group'
import { useApp } from '../store/useApp'

export default function DebtGroup() {
  const t = useT()
  const nav = useNavigate()
  const { by, key = '' } = useParams()
  const debts = useApp((s) => s.debts).filter((d) => (by === 'type' ? d.type === key : d.lender === key))
  return (
    <>
      <button className="btn btn-text" style={{ alignSelf: 'flex-start' }} onClick={() => nav('/debt')}><Icon name="back" size={14} />{t('common.back')}</button>
      <h1 className="h1">{by === 'type' ? t(`type.${key}` as never) : key}</h1>
      <div className="joined">
        {debts.map((d) => (
          <div key={d.id} className="row" role="link" tabIndex={0} onClick={() => nav(`/debt/loan/${d.id}`)} onKeyDown={(e) => e.key === 'Enter' && nav(`/debt/loan/${d.id}`)}>
            <IconTile name={TYPE_ICON[d.type]} />
            <div className="grow"><div className="strong">{d.label}</div><Badge status={d.status} /></div>
            <div className="val num">{formatBaht(d.balance)}</div>
          </div>
        ))}
      </div>
    </>
  )
}
