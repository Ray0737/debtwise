export function findUnknownFigures(reply: string, allowed: number[]): string[] {
  const out: string[] = []
  for (const m of reply.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    const raw = m[0].replace(/[.,]+$/, '')
    const n = parseFloat(raw.replace(/,/g, ''))
    if (!Number.isFinite(n) || n < 1000) continue
    const hasComma = raw.includes(',')
    const yearLike = !hasComma && /^\d{4}$/.test(raw) && ((n >= 1900 && n <= 2100) || (n >= 2500 && n <= 2700))
    if (yearLike) continue
    if (!allowed.some((a) => Math.abs(a - n) <= 1)) out.push(raw)
  }
  return out
}
