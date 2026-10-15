import type { Profile } from '../store/types'

export type ProfileField =
  | 'displayName' | 'birthYear' | 'householdSize' | 'incomeType' | 'monthlyIncome'
  | 'otherIncome' | 'payDay' | 'retireAge' | 'postRetireIncome' | 'monthlyEssentials'

const REQUIRED: ProfileField[] = ['birthYear', 'monthlyIncome', 'retireAge']

export function validateProfile(
  p: Partial<Profile>,
  fields: ProfileField[],
  now: Date = new Date(),
): Partial<Record<ProfileField, 'required' | 'invalid'>> {
  const out: Partial<Record<ProfileField, 'required' | 'invalid'>> = {}
  const year = now.getUTCFullYear()
  for (const f of fields) {
    const v = p[f]
    const empty = v === null || v === undefined || v === ''
    if (empty) { if (REQUIRED.includes(f)) out[f] = 'required'; continue }
    if (typeof v === 'number') {
      if (!Number.isFinite(v) || v < 0) out[f] = 'invalid'
      if (f === 'birthYear' && (v < 1900 || v > year)) out[f] = 'invalid'
      if (f === 'payDay' && (v < 1 || v > 31)) out[f] = 'invalid'
      if (f === 'retireAge') {
        const age = p.birthYear ? year - p.birthYear : 0
        if (v <= age || v > 100) out[f] = 'invalid'
      }
    }
  }
  return out
}
