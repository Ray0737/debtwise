import { suggestDeductions, estimateTax, formatBaht } from '../engine'
import { TAX_SOURCE, TAX_YEAR } from '../engine/tax'
import { useT } from '../i18n'
import { annualIncome } from '../lib/derive'
import { useApp } from '../store/useApp'
import { Card, Icon, Page, Row } from '../ui'

export default function Tax() {
  const t = useT()
  const { profile, lang } = useApp()
  const income = profile ? annualIncome(profile) : 0
  const est = income > 0 && profile ? estimateTax({ annualIncome: income, kind: profile.incomeType === 'freelance' ? 'freelance' : 'salary', allowances: 0 }) : null
  const ideas = est ? suggestDeductions(est.marginalRate) : []
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
      {!est ? (
        <Card><p className="muted">{t('tax.missing')}</p></Card>
      ) : (
        <>
          <Card title={t('tax.assumptions')} icon="list-ul" tone="line">
            <div className="kv"><span className="muted">{t('tax.annualIncome')}</span><span className="num strong">{formatBaht(income)}</span></div>
            <ul className="stack small">{[t('tax.as.rules', { year: TAX_YEAR }), t('tax.as.expense'), t('tax.as.personal'), ...(profile?.incomeType === 'freelance' ? [t('tax.as.freelance')] : [])].map((a) => <li key={a}>{a}</li>)}</ul>
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
