const RULES: [RegExp, string][] = [
  [/\b\d-?\d{4}-?\d{5}-?\d{2}-?\d\b/g, '[id]'],
  [/\b0\d{1,2}-?\d{3}-?\d{4}\b/g, '[phone]'],
  [/\b\d{3}-?\d-?\d{5}-?\d\b/g, '[account]'],
  [/\b\d{10,16}\b/g, '[account]'],
]

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function mask(text: string, names: string[] = []): string {
  let out = text
  for (const [re, label] of RULES) out = out.replace(re, label)
  for (const name of names) {
    if (name.trim().length < 2) continue
    out = out.replace(new RegExp(escape(name.trim()), 'gi'), '[name]')
  }
  return out
}
