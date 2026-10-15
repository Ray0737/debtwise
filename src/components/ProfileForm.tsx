import { useT } from '../i18n'
import type { ProfileField } from '../lib/validate'
import type { Profile } from '../store/types'
import { Field, NumInput, TextInput } from './Field'
import { DayPicker, YearPicker } from './Pickers'

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
          <TextInput icon="person" placeholder={t('ph.name')} value={value.displayName} onChange={(v) => onChange({ displayName: v })} />
        </Field>
      )}
      {has('birthYear') && (
        <Field label={t('field.birthYear')} error={errors.birthYear}>
          <YearPicker value={value.birthYear} onChange={(v) => onChange({ birthYear: v })} />
        </Field>
      )}
      {has('householdSize') && (
        <Field label={t('field.household')} error={errors.householdSize}>
          <NumInput icon="people" value={value.householdSize} onChange={(v) => onChange({ householdSize: v })} />
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
          <NumInput icon="coins" unit="฿" value={value.monthlyIncome} onChange={(v) => onChange({ monthlyIncome: v })} />
        </Field>
      )}
      {has('otherIncome') && (
        <Field label={t('field.otherIncome')} error={errors.otherIncome}>
          <NumInput icon="coins" unit="฿" value={value.otherIncome} onChange={(v) => onChange({ otherIncome: v ?? 0 })} />
        </Field>
      )}
      {has('payDay') && (
        <Field label={t('field.payDay')} error={errors.payDay}>
          <DayPicker value={value.payDay} onChange={(v) => onChange({ payDay: v })} optional />
        </Field>
      )}
      {has('retireAge') && (
        <Field label={t('field.retireAge')} error={errors.retireAge}>
          <NumInput icon="clock" placeholder="60" value={value.retireAge} onChange={(v) => onChange({ retireAge: v })} />
        </Field>
      )}
      {has('postRetireIncome') && (
        <Field label={t('field.postRetire')} error={errors.postRetireIncome}>
          <NumInput icon="coins" unit="฿" value={value.postRetireIncome} onChange={(v) => onChange({ postRetireIncome: v })} />
        </Field>
      )}
      {has('monthlyEssentials') && (
        <Field label={t('field.essentials')} error={errors.monthlyEssentials}>
          <NumInput icon="home" unit="฿" value={value.monthlyEssentials} onChange={(v) => onChange({ monthlyEssentials: v })} />
        </Field>
      )}
    </>
  )
}
