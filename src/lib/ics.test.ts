import { expect, test } from 'vitest'
import type { Debt } from '../engine'
import { buildIcs, nextDueDate } from './ics'

const d = (id: string, dueDay: number | null, label = 'Card'): Debt => ({
  id, lender: 'Bank', type: 'credit_card', label, balance: 1000, ratePct: 10, minPayment: 500,
  dueDay, termMonthsLeft: null, status: 'verified', sourceId: null,
})
const today = new Date(Date.UTC(2026, 9, 15))

test('one monthly event per debt that has a due day', () => {
  const ics = buildIcs([d('a', 20), d('b', null), d('c', 5)], today)
  expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
  expect(ics).toContain('RRULE:FREQ=MONTHLY;BYMONTHDAY=20')
})
test('uses CRLF line endings and a calendar wrapper', () => {
  const ics = buildIcs([d('a', 20)], today)
  expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
  expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
})
test('the first date is the next occurrence', () => {
  expect(buildIcs([d('a', 20)], today)).toContain('DTSTART;VALUE=DATE:20261020')
  expect(buildIcs([d('a', 10)], today)).toContain('DTSTART;VALUE=DATE:20261110')
})
test('due days after the 28th move to the 28th so every month has the date', () => {
  const ics = buildIcs([d('a', 31)], today)
  expect(ics).toContain('BYMONTHDAY=28')
  expect(ics).toContain('DTSTART;VALUE=DATE:20261028')
})
test('commas and semicolons in names are escaped', () => {
  expect(buildIcs([d('a', 5, 'Loan, car; new')], today)).toContain('Loan\\, car\\; new')
})
test('nextDueDate clamps to the end of a short month', () => {
  expect(new Date(nextDueDate(30, new Date(Date.UTC(2027, 1, 3)))).toISOString().slice(0, 10)).toBe('2027-02-28')
})
