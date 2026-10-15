import type { DebtType } from '../engine'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { TYPE_COLOR } from '../lib/group'

export function StackedBar({ byType, total }: { byType: Partial<Record<DebtType, number>>; total: number }) {
  const t = useT()
  const entries = (Object.entries(byType) as [DebtType, number][]).filter(([, v]) => v > 0)
  return (
    <div>
      <div className="stack" role="img" aria-label={entries.map(([k, v]) => `${t(`type.${k}` as const)} ${formatBaht(v)}`).join(', ')}>
        {entries.map(([k, v]) => <i key={k} style={{ width: `${(v / (total || 1)) * 100}%`, background: TYPE_COLOR[k] }} />)}
      </div>
      <div className="legend" style={{ marginTop: 8 }}>
        {entries.map(([k, v]) => (
          <div key={k}><span><i style={{ background: TYPE_COLOR[k] }} />{t(`type.${k}` as const)}</span><span className="num">{formatBaht(v)}</span></div>
        ))}
      </div>
    </div>
  )
}
