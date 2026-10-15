import type { Lang } from './types'

export function formatBaht(n: number): string {
  const v = Number.isFinite(n) ? n : 0
  const digits = Math.abs(v) >= 100 ? 0 : 2
  const body = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: digits })
  return `${v < 0 ? '-' : ''}฿ ${body}`
}

export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso)
  if (!iso || Number.isNaN(d.getTime())) return ''
  const locale = lang === 'th' ? 'th-TH-u-ca-buddhist' : 'en-GB'
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d)
}
