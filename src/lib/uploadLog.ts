// Last upload checks, kept in this browser so the person can see what was accepted or blocked.
// The server keeps its own log line for every upload (see api/ai.ts), which is the one to watch for abuse.
import type { UploadReason } from '../../api/_lib/upload'

export interface UploadEntry { at: string; name: string; size: number; ok: boolean; reason?: UploadReason; sha?: string }

const KEY = 'dw-upload-log'
const MAX = 20

export const loadUploads = (): UploadEntry[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter((e) => e && typeof e.name === 'string' && typeof e.ok === 'boolean') : []
  } catch { return [] }
}

export function recordUpload(e: UploadEntry): UploadEntry[] {
  const next = [e, ...loadUploads()].slice(0, MAX)
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* private mode: the log lasts until reload */ }
  return next
}
