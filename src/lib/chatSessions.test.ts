import { expect, test } from 'vitest'
import { splitSessions } from './chatSessions'

const at = (s: number) => new Date(s * 1000).toISOString()
const m = (id: string, s: number) => ({ id, createdAt: at(s) })
const ids = (r: { id: string }[][]) => r.map((x) => x.map((y) => y.id))

test('no breaks is one chat', () => expect(ids(splitSessions([m('a', 1), m('b', 2)], []))).toEqual([['a', 'b']]))
test('a break after the last message leaves an empty current chat', () => {
  expect(ids(splitSessions([m('a', 1), m('b', 2)], [at(2)]))).toEqual([['a', 'b'], []])
})
test('messages after a break start a new chat; repeated breaks collapse', () => {
  expect(ids(splitSessions([m('a', 1), m('b', 5), m('c', 9)], [at(1), at(1), at(5)]))).toEqual([['a'], ['b'], ['c']])
})
test('no messages stays one empty chat', () => expect(ids(splitSessions([], [at(3)]))).toEqual([[]]))
