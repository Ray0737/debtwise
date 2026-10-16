import { expect, test } from 'vitest'
import { LABEL, NAME, cleanName, validateProfile } from './validate'

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

test('a person name takes letters only, in any language', () => {
  for (const ok of ['Somchai', 'สมชาย ใจดี', "O'Brien-Smith", 'Ana M.']) expect(NAME.test(ok)).toBe(true)
  for (const bad of ['74', 'Bob2', '', ' x', '<b>', 'a'.repeat(61)]) expect(NAME.test(bad)).toBe(false)
  expect(validateProfile({ displayName: '74' }, ['displayName'], now).displayName).toBe('invalid')
  expect(validateProfile({ displayName: 'สมชาย' }, ['displayName'], now)).toEqual({})
})
test('typing a name drops digits and symbols', () => expect(cleanName('  12Somchai 7_!x')).toBe('Somchai x'))
test('a label can hold digits but needs a letter', () => {
  expect(LABEL.test('Car loan 2')).toBe(true)
  expect(LABEL.test('74')).toBe(false)
  expect(LABEL.test('<script>')).toBe(false)
})
test('whole-number fields reject decimals and wrong types', () => {
  expect(validateProfile({ householdSize: 2.5 }, ['householdSize'], now).householdSize).toBe('invalid')
  expect(validateProfile({ householdSize: 0 }, ['householdSize'], now).householdSize).toBe('invalid')
  expect(validateProfile({ payDay: 10.2 }, ['payDay'], now).payDay).toBe('invalid')
  expect(validateProfile({ monthlyIncome: '50000' as unknown as number }, ['monthlyIncome'], now).monthlyIncome).toBe('invalid')
})
