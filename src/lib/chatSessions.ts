// Chats are split from the one messages table by "break" points, so no database change is needed.
// A break is the createdAt of the last message when "New chat" was pressed. Later messages start a new chat.
// Server timestamps only, so client clock skew cannot misplace a message. Breaks live in this browser only.
const KEY = 'dw-chat-breaks'

export const loadBreaks = (): string[] => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}
export const saveBreaks = (b: string[]) => {
  try { localStorage.setItem(KEY, JSON.stringify(b)) } catch { /* private mode: the new chat lasts until reload */ }
}

// Last array is the current chat, and it can be empty right after a break.
export function splitSessions<T extends { createdAt: string }>(msgs: T[], breaks: string[]): T[][] {
  const cuts = breaks.map((b) => Date.parse(b)).sort((a, b) => a - b)
  const out: T[][] = [[]]
  let i = 0
  for (const m of msgs) {
    const at = Date.parse(m.createdAt)
    while (i < cuts.length && cuts[i] < at) { i++; if (out.at(-1)!.length) out.push([]) }
    out.at(-1)!.push(m)
  }
  if (msgs.length && out.at(-1)!.length && cuts.some((c) => c >= Date.parse(msgs.at(-1)!.createdAt))) out.push([])
  return out
}
