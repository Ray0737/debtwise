import { expect, test } from 'vitest'
import { findUnknownFigures } from './guard'

test('figures that the engine produced pass', () => {
  expect(findUnknownFigures('You owe 12,500 baht in 2026.', [12500])).toEqual([])
})
test('a figure the engine never produced is flagged', () => {
  expect(findUnknownFigures('This saves 99,999 baht.', [12500])).toEqual(['99,999'])
})
test('small numbers, percentages and years are ignored', () => {
  expect(findUnknownFigures('In 36 months at 8% by 2569.', [])).toEqual([])
})
test('a tolerance of one baht is allowed', () => {
  expect(findUnknownFigures('about 12,501', [12500])).toEqual([])
})
test('a 4 digit amount with a comma is checked', () => {
  expect(findUnknownFigures('pay 2,000 now', [])).toEqual(['2,000'])
})
