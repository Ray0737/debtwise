import { useT } from '../i18n'
import type { ProfileField } from '../lib/validate'
import type { Profile } from '../store/types'
import { Field, NumInput } from './Field'

interface Props {
  fields: ProfileField[]
  value: Partial<Profile>
  onChange: (patch: Partial<Profile>) => void
  errors: Partial<Record<ProfileField, 'required' | 'invalid'>>
}

export function ProfileForm({ fields, value, onChange, errors }: Props) {
  const t = useT()
  const has = (f: ProfileField) => fields.includes(f)
  return (
    <>
      {has('displayName') && (
        <Field label={t('field.displayName')} error={errors.displayName}>
          <input className="input" value={value.displayName ?? ''} onChange={(e) => onChange({ displayName: e.target.value })} />
        </Field>
      )}
      {has('birthYear') && (
        <Field label={t('field.birthYear')} error={errors.birthYear}>
          <NumInput value={value.birthYear} onChange={(v) => onChange({ birthYear: v })} placeholder="1990" />
        </Field>
      )}
      {has('householdSize') && (
        <Field label={t('field.household')} error={errors.householdSize}>
          <NumInput value={value.householdSize} onChange={(v) => onChange({ householdSize: v })} />
        </Field>
      )}
      {has('incomeType') && (
        <Field label={t('field.incomeType')}>
          <div className="chips">
            {(['salary', 'freelance', 'both'] as const).map((k) => (
              <button key={k} type="button" className={`chip${value.incomeType === k ? ' on' : ''}`} onClick={() => onChange({ incomeType: k })}>
                {t(`field.income.${k}` as const)}
              </button>
            ))}
          </div>
        </Field>
      )}
      {has('monthlyIncome') && (
        <Field label={t('field.monthlyIncome')} error={errors.monthlyIncome}>
          <NumInput value={value.monthlyIncome} onChange={(v) => onChange({ monthlyIncome: v })} />
        </Field>
      )}
      {has('otherIncome') && (
        <Field label={t('field.otherIncome')} error={errors.otherIncome}>
          <NumInput value={value.otherIncome} onChange={(v) => onChange({ otherIncome: v ?? 0 })} />
        </Field>
      )}
      {has('payDay') && (
        <Field label={t('field.payDay')} error={errors.payDay}>
          <NumInput value={value.payDay} onChange={(v) => onChange({ payDay: v })} />
        </Field>
      )}
      {has('retireAge') && (
        <Field label={t('field.retireAge')} error={errors.retireAge}>
          <NumInput value={value.retireAge} onChange={(v) => onChange({ retireAge: v })} placeholder="60" />
        </Field>
      )}
      {has('postRetireIncome') && (
        <Field label={t('field.postRetire')} error={errors.postRetireIncome}>
          <NumInput value={value.postRetireIncome} onChange={(v) => onChange({ postRetireIncome: v })} />
        </Field>
      )}
      {has('monthlyEssentials') && (
        <Field label={t('field.essentials')} error={errors.monthlyEssentials}>
          <NumInput value={value.monthlyEssentials} onChange={(v) => onChange({ monthlyEssentials: v })} />
        </Field>
      )}
    </>
  )
}
