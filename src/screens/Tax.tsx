import { DEDUCTIONS, allowanceTotal, estimateTax, formatBaht, suggestDeductions, type TaxAnswers } from '../engine'
import { TAX_SOURCE, TAX_YEAR } from '../engine/tax'
import { useT } from '../i18n'
import { annualIncome } from '../lib/derive'
import { useApp } from '../store/useApp'
import { Card, Field, Icon, NumInput, Page, Row, Seg } from '../ui'

// Questions whose answers feed allowanceTotal, in the order a person thinks about them.
const AMOUNTS: { key: keyof TaxAnswers; id: string }[] = [
  { key: 'socialSecurity', id: 'social_security' },
  { key: 'lifeInsurance', id: 'life_insurance' },
  { key: 'healthInsurance', id: 'health_insurance' },
  { key: 'homeLoanInterest', id: 'home_loan_interest' },
  { key: 'childbirth', id: 'childbirth' },
]

export default function Tax() {
  const t = useT()
  const { profile, lang, taxAnswers: a, setTaxAnswers } = useApp()
  const income = profile ? annualIncome(profile) : 0
  const kind = profile?.incomeType === 'freelance' ? 'freelance' : 'salary'
  const allowances = allowanceTotal(a)
  const base = income > 0 ? estimateTax({ annualIncome: income, kind, allowances: 0 }) : null
  const est = income > 0 ? estimateTax({ annualIncome: income, kind, allowances }) : null
  const ideas = est ? suggestDeductions(est.marginalRate) : []
  const set = <K extends keyof TaxAnswers>(k: K, v: TaxAnswers[K]) => setTaxAnswers({ ...a, [k]: v })
  const n = (k: keyof TaxAnswers) => (typeof a[k] === 'number' && a[k] ? (a[k] as number) : null)
  const label = (id: string) => DEDUCTIONS.find((d) => d.id === id)!

  return (
    <Page
      icon="receipt"
      title={t('nav.tax')}
      desc={t('desc.tax')}
      hero={est ? (
        <>
          <span className="small">{t('tax.due')} · {t('tax.year')} {TAX_YEAR}</span>
          <span className="big num">{formatBaht(est.tax)}</span>
          <span className="small"><span className="badge out"><Icon n="patch-check" />{t('tax.official')}</span></span>
        </>
      ) : undefined}
    >
      {!est || !base ? (
        <Card><p className="muted">{t('tax.missing')}</p></Card>
      ) : (
        <>
          <Card title={t('tax.formTitle')} icon="ui-checks" >
            <p className="small muted">{t('tax.formLine')}</p>
            <div className="stack">
              <Field label={t('tax.q.spouse')}>
                <Seg value={a.spouse ? 'yes' : 'no'} onChange={(v) => set('spouse', v === 'yes')}
                  options={[{ v: 'no', label: t('tax.no') }, { v: 'yes', label: t('tax.yes') }]} />
              </Field>
              <Field label={t('tax.q.children')}><NumInput value={n('children')} onChange={(v) => set('children', Math.max(0, Math.floor(v ?? 0)))} /></Field>
              {a.children > 0 && (
                <Field label={t('tax.q.later')}><NumInput value={n('laterChildren')} onChange={(v) => set('laterChildren', Math.max(0, Math.floor(v ?? 0)))} /></Field>
              )}
              <Field label={t('tax.q.parents')}><NumInput value={n('parents')} onChange={(v) => set('parents', Math.max(0, Math.floor(v ?? 0)))} /></Field>
              <span className="small muted">{t('tax.q.paid')}</span>
              {AMOUNTS.map(({ key, id }) => (
                <Field key={key} label={`${label(id).label[lang]} · ${t('tax.upTo', { amount: formatBaht(label(id).maxAmount) })}`}>
                  <NumInput value={n(key)} onChange={(v) => set(key, Math.max(0, v ?? 0))} />
                </Field>
              ))}
            </div>
            <div className="kv"><span className="muted">{t('tax.allowances')}</span><span className="num strong">{formatBaht(allowances)}</span></div>
            <div className="kv"><span className="muted">{t('tax.without')}</span><span className="num">{formatBaht(base.tax)}</span></div>
            <div className="kv"><span className="muted">{t('tax.saved')}</span><span className="num strong">{formatBaht(base.tax - est.tax)}</span></div>
          </Card>
          <Card title={t('tax.assumptions')} icon="list-ul" tone="line">
            <div className="kv"><span className="muted">{t('tax.annualIncome')}</span><span className="num strong">{formatBaht(income)}</span></div>
            <ul className="stack small">{[t('tax.as.rules', { year: TAX_YEAR }), t('tax.as.expense'), t('tax.as.personal'), ...(allowances > 0 ? [t('tax.as.answers', { amount: formatBaht(allowances) })] : []), ...(kind === 'freelance' ? [t('tax.as.freelance')] : [])].map((x) => <li key={x}>{x}</li>)}</ul>
          </Card>
          <div className="stack">
            <h2>{t('tax.reduce')}</h2>
            <p className="small muted">{t('tax.reduceLine')}</p>
            <div className="card">
              <div className="list">
                {ideas.map(({ deduction: d, estimatedSaving }) => (
                  <Row key={d.id} icon="piggy-bank" title={<span className="wrapsub">{d.label[lang]}</span>} sub={`${t('tax.paperwork')}: ${d.paperwork[lang]}`}
                    value={<><span className="small muted" style={{ display: 'block' }}>{t('tax.maySave')}</span>{formatBaht(estimatedSaving)}</>} />
                ))}
              </div>
            </div>
          </div>
          <p className="small muted"><Icon n="info-circle" /> {t('tax.disclaimer')} {t('tax.source')}: <a className="link" href={TAX_SOURCE.url} target="_blank" rel="noreferrer">rd.go.th</a>, {TAX_SOURCE.asOf}</p>
        </>
      )}
    </Page>
  )
}
