import type { Lang } from '../engine'
import { en, type Key } from './en'
import { th } from './th'

export type { Key }
const dict: Record<Lang, Record<Key, string>> = { en, th }

export function tr(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  let s = dict[lang][key] ?? en[key]
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}
