import { expect, test } from 'vitest'
import { mask } from './mask'

test('masks a Thai national ID with dashes', () => {
  expect(mask('ID 1-2345-67890-12-3 ok')).toBe('ID [id] ok')
})
test('masks a 13 digit ID without dashes', () => {
  expect(mask('1234567890123')).toBe('[id]')
})
test('masks a phone number inside Thai text', () => {
  expect(mask('โทร 081-234-5678 ได้เลย')).toBe('โทร [phone] ได้เลย')
})
test('masks a bank account number', () => {
  expect(mask('acct 123-4-56789-0')).toBe('acct [account]')
  expect(mask('acct 1234567890')).toBe('acct [account]')
})
test('masks known names, case insensitive, including regex characters', () => {
  expect(mask('สมชาย โอนเงิน', ['สมชาย'])).toBe('[name] โอนเงิน')
  expect(mask('Hello Ann (B.)', ['ann (b.)'])).toBe('Hello [name]')
})
test('leaves ordinary text and money amounts alone', () => {
  expect(mask('balance 85,000 baht at 16%')).toBe('balance 85,000 baht at 16%')
})
test('ignores empty or one letter names', () => {
  expect(mask('a b c', ['', 'a'])).toBe('a b c')
})
