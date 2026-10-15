import { afterEach, expect, test } from 'vitest'
import { withFallback } from './providers'

const fail = { generate: async () => { throw new Error('primary down') } }
const ok = { generate: async () => 'backup answer' }
const msg = [{ role: 'user' as const, text: 'hi' }]
afterEach(() => { delete process.env.GROQ_API_KEY })

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
