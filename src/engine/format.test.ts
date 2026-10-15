import { expect, test } from 'vitest'
import { formatBaht, formatDate } from './format'

test('formatBaht groups thousands and drops decimals from 100 up', () => {
  expect(formatBaht(1234567)).toBe('฿ 1,234,567')
  expect(formatBaht(1234.56)).toBe('฿ 1,235')
})
test('formatBaht keeps up to two decimals under 100', () => {
  expect(formatBaht(45.5)).toBe('฿ 45.5')
})
test('formatBaht puts the minus sign first', () => {
  expect(formatBaht(-1500)).toBe('-฿ 1,500')
})
test('formatBaht treats NaN as zero', () => {
  expect(formatBaht(NaN)).toBe('฿ 0')
})
test('formatDate uses Buddhist era in Thai and Gregorian in English', () => {
  expect(formatDate('2026-10-15', 'th')).toContain('2569')
  expect(formatDate('2026-10-15', 'en')).toContain('2026')
})
test('formatDate returns empty string for invalid input', () => {
  expect(formatDate('not a date', 'th')).toBe('')
  expect(formatDate('', 'en')).toBe('')
})
