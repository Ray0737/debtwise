import { formatBaht, estimateTax, SAMPLE_TAX_YEAR, suggestDeductions } from '../engine'
import { useT } from '../i18n'
import { annualIncome } from '../lib/derive'
import { useApp } from '../store/useApp'

export default function Tax() {
  const t = useT()
  const { profile, lang } = useApp()
  if (!profile || !profile.monthlyIncome) return <p className="muted">{t('tax.missing')}</p>
  const income = annualIncome(profile)
  const est = estimateTax({ annualIncome: income, kind: profile.incomeType === 'freelance' ? 'freelance' : 'salary', allowances: 0 })
  const ideas = suggestDeductions(est.marginalRate)

  return (
    <>
      <h1 className="h1">{t('tax.title')}</h1>
      <div className="card card-dark">
        <span className="muted">{t('tax.year')} {SAMPLE_TAX_YEAR}, {t('common.sample')}</span>
        <span className="muted">{t('tax.annualIncome')}: <span className="num">{formatBaht(income)}</span></span>
        <span className="muted">{t('tax.due')} ({t('common.estimate')})</span>
        <span className="display accent num">{formatBaht(est.tax)}</span>
      </div>
      <div className="card">
        <h2 className="h2">{t('tax.assumptions')}</h2>
        {est.assumptions.map((a) => <span key={a} className="small">{a}</span>)}
      </div>
      <h2 className="h2">{t('tax.reduce')}</h2>
      <p className="muted">{t('tax.reduceLine')}</p>
      <div className="joined">
        {ideas.map(({ deduction: d, estimatedSaving }) => (
          <div key={d.id} className="row" style={{ cursor: 'default' }}>
            <div className="grow">
              <div>{d.label[lang]}</div>
              <div className="muted small">{t('tax.paperwork')}: {d.paperwork[lang]}, {t('common.sample')}</div>
            </div>
            <div className="val"><div className="muted small">{t('tax.maySave')}</div><div className="num">{formatBaht(estimatedSaving)}</div></div>
          </div>
        ))}
      </div>
      <p className="muted small">{t('tax.disclaimer')}</p>
    </>
  )
}
