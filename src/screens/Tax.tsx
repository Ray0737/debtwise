import { suggestDeductions, estimateTax, formatBaht } from '../engine'
import { SAMPLE_TAX_YEAR } from '../engine/tax'
import { useT } from '../i18n'
import { annualIncome } from '../lib/derive'
import { useApp } from '../store/useApp'
import { Card, Icon, Page, Row, SampleTag } from '../ui'

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
          <span className="small">{t('tax.due')} · {t('tax.year')} {SAMPLE_TAX_YEAR}</span>
          <span className="big num">{formatBaht(est.tax)}</span>
          <span className="small"><SampleTag /></span>
        </>
      ) : undefined}
    >
      {!est ? (
        <Card><p className="muted">{t('tax.missing')}</p></Card>
      ) : (
        <>
          <Card title={t('tax.assumptions')} icon="list-ul" tone="line">
            <div className="kv"><span className="muted">{t('tax.annualIncome')}</span><span className="num strong">{formatBaht(income)}</span></div>
            <ul className="stack small">{est.assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
          </Card>
          <div className="stack">
            <h2>{t('tax.reduce')}</h2>
            <p className="small muted">{t('tax.reduceLine')}</p>
            <div className="card">
              <div className="list">
                {ideas.map(({ deduction: d, estimatedSaving }) => (
                  <Row key={d.id} icon="piggy-bank" title={d.label[lang]} sub={`${t('tax.paperwork')}: ${d.paperwork[lang]}`}
                    value={<><span className="small muted" style={{ display: 'block' }}>{t('tax.maySave')}</span>{formatBaht(estimatedSaving)}</>} />
                ))}
              </div>
            </div>
          </div>
          <p className="small muted"><Icon n="info-circle" /> {t('tax.disclaimer')}</p>
        </>
      )}
    </Page>
  )
}
