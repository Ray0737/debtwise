import { afterEach, expect, test, vi } from 'vitest'
import { pickProvider, withFallback } from './providers'

const fail = { generate: async () => { throw new Error('primary down') } }
const ok = { generate: async () => 'backup answer' }
const msg = [{ role: 'user' as const, text: 'hi' }]
afterEach(() => { delete process.env.GROQ_API_KEY; vi.unstubAllGlobals() })

test('falls back to the backup when the primary fails and a backup key exists', async () => {
  process.env.GROQ_API_KEY = 'x'
  expect(await withFallback(fail, ok).generate({ system: 's', messages: msg })).toBe('backup answer')
})
test('does not fall back without a backup key', async () => {
  await expect(withFallback(fail, ok).generate({ system: 's', messages: msg })).rejects.toThrow('primary down')
})
test('does not fall back for file requests, because the backup cannot read files', async () => {
  process.env.GROQ_API_KEY = 'x'
  await expect(withFallback(fail, ok).generate({ system: 's', messages: msg, inline: { mimeType: 'image/jpeg', data: 'x' } })).rejects.toThrow('primary down')
})

const geminiOk = () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }] }))
const input = { system: 's', messages: [{ role: 'user' as const, text: 'hi' }] }

test('gemini retries 503 and 429, then succeeds', async () => {
  process.env.GEMINI_API_KEY = 'k'
  const f = vi.fn().mockResolvedValueOnce(new Response('', { status: 503 })).mockResolvedValueOnce(new Response('', { status: 429 })).mockResolvedValueOnce(geminiOk())
  vi.stubGlobal('fetch', f)
  expect(await pickProvider().generate(input)).toBe('{"ok":true}')
  expect(f).toHaveBeenCalledTimes(3)
}, 10_000)

test('gemini gives up after 3 tries and does not retry other errors', async () => {
  process.env.GEMINI_API_KEY = 'k'
  const busy = vi.fn().mockImplementation(async () => new Response('', { status: 503 }))
  vi.stubGlobal('fetch', busy)
  await expect(pickProvider().generate(input)).rejects.toThrow('Gemini 503')
  expect(busy).toHaveBeenCalledTimes(3)

  const bad = vi.fn().mockImplementation(async () => new Response('', { status: 400 }))
  vi.stubGlobal('fetch', bad)
  await expect(pickProvider().generate(input)).rejects.toThrow('Gemini 400')
  expect(bad).toHaveBeenCalledTimes(1)
}, 10_000)
