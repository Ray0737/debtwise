import { expect, test } from 'vitest'
import { THAI_BANKS, bankColor } from './bank'

test('every listed bank resolves to its own colour, by English and Thai name', () => {
  for (const b of THAI_BANKS) {
    expect(bankColor(b.en)).toEqual({ background: b.bg, color: b.fg })
    expect(bankColor(b.th)).toEqual({ background: b.bg, color: b.fg })
  }
})
test('unknown lender has no colour', () => expect(bankColor('Uncle Somchai')).toBeNull())
