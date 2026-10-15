import { expect, test } from 'vitest'
import { validateProfile } from './validate'

const now = new Date(Date.UTC(2026, 9, 15))

test('required fields are reported when missing', () => {
  const e = validateProfile({}, ['birthYear', 'monthlyIncome', 'retireAge'], now)
  expect(e).toEqual({ birthYear: 'required', monthlyIncome: 'required', retireAge: 'required' })
})
test('valid values produce no errors', () => {
  expect(validateProfile({ birthYear: 1988, monthlyIncome: 52000, retireAge: 60 }, ['birthYear', 'monthlyIncome', 'retireAge'], now)).toEqual({})
})
test('birth year must be a plausible Gregorian year', () => {
  expect(validateProfile({ birthYear: 2531 }, ['birthYear'], now).birthYear).toBe('invalid')
  expect(validateProfile({ birthYear: 1850 }, ['birthYear'], now).birthYear).toBe('invalid')
})
test('income cannot be negative', () => {
  expect(validateProfile({ monthlyIncome: -1 }, ['monthlyIncome'], now).monthlyIncome).toBe('invalid')
})
test('retirement age must be above the current age', () => {
  expect(validateProfile({ birthYear: 1980, retireAge: 40 }, ['retireAge'], now).retireAge).toBe('invalid')
  expect(validateProfile({ birthYear: 1980, retireAge: 60 }, ['retireAge'], now).retireAge).toBeUndefined()
})
test('optional fields may be empty but not negative', () => {
  expect(validateProfile({}, ['monthlyEssentials'], now)).toEqual({})
  expect(validateProfile({ monthlyEssentials: -5 }, ['monthlyEssentials'], now).monthlyEssentials).toBe('invalid')
})
