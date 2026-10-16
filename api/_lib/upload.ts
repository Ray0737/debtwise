// Upload checks shared by the browser (before sending) and the API (before the file reaches the AI).
// Not an antivirus: it checks the type by the file's own first bytes, the size, and PDFs for scripts and embedded files.
// ponytail: the PDF scan is a keyword search, so an obfuscated name (#4a for J) gets past it. Upgrade path: scan with ClamAV or VirusTotal on the server.
export type UploadReason = 'type' | 'mismatch' | 'size' | 'empty' | 'active'
export type UploadVerdict =
  | { ok: true; size: number; sha256: string }
  | { ok: false; size: number; reason: UploadReason }

export const MAX_UPLOAD_BYTES = 10_000_000

const starts = (b: Uint8Array, sig: number[], at = 0) => sig.every((x, i) => b[at + i] === x)
const MAGIC: Record<string, (b: Uint8Array) => boolean> = {
  'application/pdf': (b) => starts(b, [0x25, 0x50, 0x44, 0x46, 0x2d]),
  'image/jpeg': (b) => starts(b, [0xff, 0xd8, 0xff]),
  'image/png': (b) => starts(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  'image/webp': (b) => starts(b, [0x52, 0x49, 0x46, 0x46]) && starts(b, [0x57, 0x45, 0x42, 0x50], 8),
}
export const BROWSER_TYPES = Object.keys(MAGIC)
export const SERVER_TYPES = ['application/pdf', 'image/jpeg']

const ACTIVE_PDF = /\/(JavaScript|JS|Launch|EmbeddedFile)\b/

export async function inspectFile(bytes: Uint8Array, mime: string, allowed: string[]): Promise<UploadVerdict> {
  const size = bytes.length
  const no = (reason: UploadReason): UploadVerdict => ({ ok: false, size, reason })
  if (!allowed.includes(mime) || !MAGIC[mime]) return no('type')
  if (size === 0) return no('empty')
  if (size > MAX_UPLOAD_BYTES) return no('size')
  if (!MAGIC[mime](bytes)) return no('mismatch')
  if (mime === 'application/pdf' && ACTIVE_PDF.test(new TextDecoder('latin1').decode(bytes))) return no('active')
  const hash = await crypto.subtle.digest('SHA-256', bytes as BufferSource)
  return { ok: true, size, sha256: [...new Uint8Array(hash)].map((x) => x.toString(16).padStart(2, '0')).join('') }
}

// A name that is safe to store and show: no path, control characters or markup characters.
export const safeFileName = (name: string) =>
  name.replace(/^.*[\\/]/, '').replace(/[\u0000-\u001f<>:"|?*]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'file'
