import { useState } from 'react'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { compareToDebt, loadSpare, monthlyInterest, saveSpare, type SpareAccount } from '../lib/spareCash'
import { useApp } from '../store/useApp'
import { Field, Icon, NumInput, Row, TextInput } from '../ui'

export function SpareCash() {
  const t = useT()
  const debts = useApp((s) => s.debts)
  const [accounts, setAccounts] = useState(loadSpare)
  const [draft, setDraft] = useState<{ name: string; balance: number | null; ratePct: number | null }>({ name: '', balance: null, ratePct: null })
  const [bad, setBad] = useState(false)
  const commit = (next: SpareAccount[]) => { saveSpare(next); setAccounts(next) }

  const add = () => {
    if (!draft.balance || draft.balance <= 0 || draft.ratePct === null) return setBad(true)
    commit([...accounts, { id: crypto.randomUUID(), name: draft.name.trim() || t('spare.defaultName'), balance: draft.balance, ratePct: draft.ratePct }])
    setDraft({ name: '', balance: null, ratePct: null }); setBad(false)
  }
  const earned = accounts.reduce((n, a) => n + monthlyInterest(a.balance, a.ratePct), 0)
  const cmp = compareToDebt(accounts, debts)
  const max = cmp ? Math.max(cmp.earns, cmp.costs, 1) : 1

  return (
    <div className="stack">
      <h2>{t('spare.title')}</h2>
      <p className="small muted">{t('spare.line')}</p>
      <div className="card">
        {accounts.length === 0 && <p className="small muted">{t('spare.empty')}</p>}
        <div className="list">
          {accounts.map((a) => (
            <Row key={a.id} icon="piggy-bank" title={a.name} sub={`${a.ratePct}% · ${t('spare.perMonth', { amount: formatBaht(monthlyInterest(a.balance, a.ratePct)) })}`} value={formatBaht(a.balance)}>
              <button className="link small" onClick={() => commit(accounts.filter((x) => x.id !== a.id))}>{t('spare.remove')}</button>
            </Row>
          ))}
        </div>
        {accounts.length > 0 && (
          <div className="accrued"><span className="ico"><Icon n="percent" /></span><span className="grow"><span className="small muted">{t('spare.accrued')}</span></span><span className="strong num">{formatBaht(earned)}</span></div>
        )}
      </div>
      {cmp && (
        <div className="card cmp">
          <p className="small">{t('spare.compare', { amount: formatBaht(cmp.amount), lender: cmp.lender })}</p>
          <div className="cmprow"><span className="small">{t('spare.earns')} · {cmp.earnPct.toFixed(1)}%</span><div className="cmpbar"><i className="earn" style={{ width: `${(cmp.earns / max) * 100}%` }} /></div><span className="num small">{formatBaht(cmp.earns)}</span></div>
          <div className="cmprow"><span className="small">{t('spare.costs')} · {cmp.debtPct}%</span><div className="cmpbar"><i className="cost" style={{ width: `${(cmp.costs / max) * 100}%` }} /></div><span className="num small">{formatBaht(cmp.costs)}</span></div>
          <p className="small muted">{t('invest.disclaimer')}</p>
        </div>
      )}
      <div className="card stack">
        <Field label={t('spare.name')}><TextInput value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder={t('spare.defaultName')} /></Field>
        <Field label={t('spare.balance')} error={bad && !(draft.balance && draft.balance > 0) ? t('field.required') : undefined}><NumInput value={draft.balance} onChange={(v) => setDraft({ ...draft, balance: v })} /></Field>
        <Field label={t('spare.rate')} error={bad && draft.ratePct === null ? t('field.required') : undefined}><NumInput value={draft.ratePct} onChange={(v) => setDraft({ ...draft, ratePct: v })} /></Field>
        <button className="btn" onClick={add}><Icon n="plus-lg" />{t('spare.add')}</button>
      </div>
    </div>
  )
}
