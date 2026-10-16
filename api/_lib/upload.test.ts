import { expect, test } from 'vitest'
import { BROWSER_TYPES, SERVER_TYPES, inspectFile, safeFileName } from './upload'

const enc = (s: string) => new TextEncoder().encode(s)
const pdf = (body = '') => enc(`%PDF-1.7\n${body}\n%%EOF`)
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10])

test('a plain pdf and a jpeg pass and get a sha256', async () => {
  const a = await inspectFile(pdf('1 0 obj <<>> endobj'), 'application/pdf', SERVER_TYPES)
  expect(a.ok && a.sha256).toHaveLength(64)
  expect((await inspectFile(jpeg, 'image/jpeg', SERVER_TYPES)).ok).toBe(true)
})
test('type must be allowed and match the first bytes', async () => {
  expect(await inspectFile(enc('MZ exe'), 'application/x-msdownload', BROWSER_TYPES)).toMatchObject({ ok: false, reason: 'type' })
  expect(await inspectFile(enc('<script>alert(1)</script>'), 'application/pdf', SERVER_TYPES)).toMatchObject({ ok: false, reason: 'mismatch' })
  expect(await inspectFile(pdf(), 'image/jpeg', SERVER_TYPES)).toMatchObject({ ok: false, reason: 'mismatch' })
  expect(await inspectFile(jpeg, 'image/png', SERVER_TYPES)).toMatchObject({ ok: false, reason: 'type' })
})
test('empty and oversize files are refused', async () => {
  expect(await inspectFile(new Uint8Array(0), 'application/pdf', SERVER_TYPES)).toMatchObject({ ok: false, reason: 'empty' })
  const big = new Uint8Array(10_000_001); big.set([0xff, 0xd8, 0xff])
  expect(await inspectFile(big, 'image/jpeg', SERVER_TYPES)).toMatchObject({ ok: false, reason: 'size' })
})
test('a pdf with scripts, launch actions or embedded files is refused', async () => {
  for (const k of ['/JavaScript (app.alert(1))', '/JS (x)', '/Launch /Win', '/EmbeddedFile']) {
    expect(await inspectFile(pdf(k), 'application/pdf', SERVER_TYPES)).toMatchObject({ ok: false, reason: 'active' })
  }
})
test('file names lose paths, control characters and markup characters', () => {
  expect(safeFileName('C:\\fakepath\\..\\bill<img>.pdf')).toBe('billimg.pdf')
  expect(safeFileName('a\u0000b\n.pdf')).toBe('ab.pdf')
  expect(safeFileName('???')).toBe('file')
  expect(safeFileName('x'.repeat(200))).toHaveLength(80)
})
