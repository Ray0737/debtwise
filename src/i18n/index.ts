import { useApp } from '../store/useApp'
import { tr, type Key } from './tr'

export { tr }
export type { Key }

export function useT() {
  const lang = useApp((s) => s.lang)
  return (key: Key, vars?: Record<string, string | number>) => tr(lang, key, vars)
}
