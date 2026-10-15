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
    const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'
    const contents = i.messages.map((m, idx) => {
      const parts: unknown[] = [{ text: m.text }]
      if (i.inline && idx === i.messages.length - 1) parts.push({ inlineData: { mimeType: i.inline.mimeType, data: i.inline.data } })
      return { role: m.role === 'assistant' ? 'model' : 'user', parts }
    })
    const call = () => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: i.system }] },
        contents,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    })
    // The model is sometimes busy (503) or rate limited (429). Two short retries keep a demo from failing on a blip.
    let r = await call()
    for (let n = 1; n <= 2 && [429, 500, 503].includes(r.status); n++) {
      await new Promise((ok) => setTimeout(ok, 700 * n))
      r = await call()
    }
    if (!r.ok) throw new Error(`Gemini ${r.status}`)
    const j = (await r.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] }
    // Newer models may add thought parts. Keep only the answer text.
    return (j.candidates?.[0]?.content?.parts ?? []).filter((x) => x.text && !x.thought).map((x) => x.text).join('')
  },
}

// Fallback when Gemini is down or rate limited. Text only: Groq cannot read the inline files.
// The default model was confirmed live on 2026-09-13 in the Edu project.
export const groq: Provider = {
  async generate(i) {
    const key = process.env.GROQ_API_KEY
    if (!key) throw new Error('GROQ_API_KEY is not set')
    if (i.inline) throw new Error('Groq cannot read files')
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: i.system }, ...i.messages.map((m) => ({ role: m.role, content: m.text }))],
      }),
      signal: AbortSignal.timeout(25000),
    })
    if (!r.ok) throw new Error(`Groq ${r.status}`)
    const j = (await r.json()) as { choices?: { message?: { content?: string } }[] }
    return j.choices?.[0]?.message?.content ?? ''
  },
}

// Gemini first. If it still fails after its retries and a Groq key exists, answer text requests with Groq.
export const withFallback = (primary: Provider, backup: Provider): Provider => ({
  async generate(i) {
    try {
      return await primary.generate(i)
    } catch (e) {
      if (!process.env.GROQ_API_KEY || i.inline) throw e
      return backup.generate(i)
    }
  },
})

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
  return name === 'ubot' && process.env.UBOT_API_URL ? ubot : withFallback(gemini, groq)
}
