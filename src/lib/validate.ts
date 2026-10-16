import type { Profile } from '../store/types'

export type ProfileField =
  | 'displayName' | 'birthYear' | 'householdSize' | 'incomeType' | 'monthlyIncome'
  | 'otherIncome' | 'payDay' | 'retireAge' | 'postRetireIncome' | 'monthlyEssentials'

const REQUIRED: ProfileField[] = ['birthYear', 'monthlyIncome', 'retireAge']
const INTEGER: ProfileField[] = ['birthYear', 'householdSize', 'payDay', 'retireAge']

// A person's name: letters (any language), marks such as Thai vowels, spaces, dot, apostrophe, hyphen. No digits.
export const NAME = /^[\p{L}\p{M}][\p{L}\p{M} .'-]{0,59}$/u
// A loan or lender label: may hold digits ("Car loan 2") but must contain a letter, so "74" is not a name.
export const LABEL = /^(?=.*\p{L})[\p{L}\p{M}\p{N} .,'&()/#+-]{1,60}$/u
// Typing in a name box drops anything a name cannot hold, so digits never appear.
export const cleanName = (v: string) => v.replace(/[^\p{L}\p{M} .'-]/gu, '').replace(/^[^\p{L}\p{M}]+/u, '').slice(0, 60)

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
    if (f === 'displayName') { if (typeof v !== 'string' || !NAME.test(v.trim())) out[f] = 'invalid'; continue }
    if (f === 'incomeType') continue
    if (typeof v !== 'number') { out[f] = 'invalid'; continue }
    {
      if (!Number.isFinite(v) || v < 0) out[f] = 'invalid'
      if (INTEGER.includes(f) && !Number.isInteger(v)) out[f] = 'invalid'
      if (f === 'householdSize' && (v < 1 || v > 30)) out[f] = 'invalid'
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
