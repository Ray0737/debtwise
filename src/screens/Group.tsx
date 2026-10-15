import { useParams } from 'react-router-dom'
import { formatBaht, type DebtType } from '../engine'
import { useT } from '../i18n'
import { useApp } from '../store/useApp'
import { Page, Row } from '../ui'
import { TYPE_ICON } from './DebtForm'

export default function Group() {
  const t = useT()
  const { by, key = '' } = useParams()
  const debts = useApp((s) => s.debts)
  const name = decodeURIComponent(key)
  const list = debts.filter((d) => (by === 'type' ? d.type === name : d.lender === name))
  const total = list.reduce((s, d) => s + d.balance, 0)
  return (
    <Page
      title={by === 'type' ? t(`type.${name as DebtType}` as const) : name}
      back="/debt"
      hero={<><span className="small">{t('common.owed')}</span><span className="big num">{formatBaht(total)}</span></>}
    >
      <div className="card">
        <div className="list">
          {list.map((d) => (
            <Row key={d.id} icon={TYPE_ICON[d.type as DebtType]} title={d.label} sub={by === 'type' ? d.lender : t(`type.${d.type}` as const)}
              value={formatBaht(d.balance)} to={`/debt/loan/${d.id}`} />
          ))}
        </div>
      </div>
    </Page>
  )
}
