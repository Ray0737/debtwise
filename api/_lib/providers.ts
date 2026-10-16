export interface GenInput {
  system: string
  messages: { role: 'user' | 'assistant'; text: string }[]
  inline?: { mimeType: string; data: string }
}
export interface Provider {
  generate(i: GenInput): Promise<string>
}

const gemini: Provider = {
  async generate(i) {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY is not set')
    const model = process.env.GEMINI_MODEL || 'gemini-3.7-flash'
    const contents = i.messages.map((m, idx) => {
      const parts: unknown[] = [{ text: m.text }]
      if (i.inline && idx === i.messages.length - 1) parts.push({ inlineData: { mimeType: i.inline.mimeType, data: i.inline.data } })
      return { role: m.role === 'assistant' ? 'model' : 'user', parts }
    })
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: i.system }] },
      contents,
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    })
    // Busy (503) or rate limited (429): wait 1s, then 2s. One 25s deadline for all tries, inside the 30s function limit in vercel.json.
    const signal = AbortSignal.timeout(25_000)
    let r: Response
    for (let attempt = 0; ; attempt++) {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body,
        signal,
      })
      if ((r.status !== 503 && r.status !== 429) || attempt >= 2) break
      await new Promise((ok) => setTimeout(ok, 1000 * 2 ** attempt))
    }
    if (!r.ok) throw new Error(`Gemini ${r.status}`)
    const j = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
    return j.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  },
}

// U-Bot interface is unknown. Adjust the request and response shape once its documentation is available.
const ubot: Provider = {
  async generate(i) {
    const url = process.env.UBOT_API_URL
    const key = process.env.UBOT_API_KEY
    if (!url || !key) throw new Error('U-Bot is not configured')
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({ system: i.system, messages: i.messages }),
    })
    if (!r.ok) throw new Error(`U-Bot ${r.status}`)
    const j = (await r.json()) as { text?: string }
    return j.text ?? ''
  },
}

export function pickProvider(name?: string): Provider {
  return name === 'ubot' && process.env.UBOT_API_URL ? ubot : gemini
}
