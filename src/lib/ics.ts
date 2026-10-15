import type { Debt } from '../engine'

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
const ymd = (ms: number) => new Date(ms).toISOString().slice(0, 10).replace(/-/g, '')

export function nextDueDate(dueDay: number, today: Date = new Date()): number {
  const y = today.getUTCFullYear()
  const m = today.getUTCMonth()
  const last = (yy: number, mm: number) => new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate()
  const todayMs = Date.UTC(y, m, today.getUTCDate())
  let t = Date.UTC(y, m, Math.min(dueDay, last(y, m)))
  if (t < todayMs) t = Date.UTC(y, m + 1, Math.min(dueDay, last(y, m + 1)))
  return t
}

// ponytail: due days after the 28th are moved to the 28th so a monthly rule never skips a short month.
export function buildIcs(debts: Debt[], today: Date = new Date()): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Debtwise//EN']
  for (const d of debts) {
    if (!d.dueDay) continue
    const day = Math.min(d.dueDay, 28)
    lines.push(
      'BEGIN:VEVENT',
      `UID:${d.id}@debtwise`,
      `DTSTAMP:${ymd(today.getTime())}T000000Z`,
      `DTSTART;VALUE=DATE:${ymd(nextDueDate(day, today))}`,
      `RRULE:FREQ=MONTHLY;BYMONTHDAY=${day}`,
      `SUMMARY:${esc(`Pay ${d.label} ${d.lender} ${d.minPayment}`)}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}
