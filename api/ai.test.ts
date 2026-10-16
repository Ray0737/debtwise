import { expect, test } from 'vitest'
import { overLimit } from './ai'

test('rate limit allows 20 calls a minute per user, then blocks, then resets', () => {
  for (let i = 0; i < 20; i++) expect(overLimit('u1', 1000)).toBe(false)
  expect(overLimit('u1', 1000)).toBe(true)
  expect(overLimit('u2', 1000)).toBe(false)
  expect(overLimit('u1', 1000 + 61_000)).toBe(false)
})
