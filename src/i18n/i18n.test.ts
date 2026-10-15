import { expect, test } from 'vitest'
import { en } from './en'
import { th } from './th'
import { tr } from './tr'

test('Thai and English have exactly the same keys', () => {
  expect(Object.keys(th).sort()).toEqual(Object.keys(en).sort())
})
test('no value is empty', () => {
  for (const [k, v] of [...Object.entries(en), ...Object.entries(th)]) expect(v.trim().length, k).toBeGreaterThan(0)
})
test('no em dash in any text', () => {
  for (const v of [...Object.values(en), ...Object.values(th)]) expect(v.includes('—')).toBe(false)
})
test('placeholders match between languages', () => {
  const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',')
  for (const k of Object.keys(en) as (keyof typeof en)[]) expect(ph(th[k]), k).toBe(ph(en[k]))
})
test('tr fills placeholders and falls back to English', () => {
  expect(tr('en', 'home.greeting', { name: 'Ann' })).toBe('Hello, Ann')
  expect(tr('th', 'home.greeting', { name: 'แอน' })).toBe('สวัสดี แอน')
})
