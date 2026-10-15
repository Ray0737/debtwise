import type { Lang } from '../engine'
import { authHeader } from './ai'

export async function recordOnce(): Promise<{ stop: () => Promise<Blob> }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const rec = new MediaRecorder(stream)
  const chunks: Blob[] = []
  rec.ondataavailable = (e) => chunks.push(e.data)
  rec.start()
  return {
    stop: () => new Promise<Blob>((resolve) => {
      rec.onstop = () => { stream.getTracks().forEach((t) => t.stop()); resolve(new Blob(chunks, { type: rec.mimeType })) }
      rec.stop()
    }),
  }
}

function toBase64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result).split(',')[1] ?? '')
    r.onerror = () => rej(r.error)
    r.readAsDataURL(blob)
  })
}

export async function transcribe(blob: Blob, lang: Lang): Promise<string> {
  const r = await fetch('/api/stt', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ audioBase64: await toBase64(blob), mimeType: blob.type, lang }),
  })
  if (!r.ok) throw new Error('stt failed')
  return ((await r.json()) as { text: string }).text
}

export async function speak(text: string): Promise<void> {
  const r = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ text }),
  })
  if (!r.ok) return
  const url = URL.createObjectURL(await r.blob())
  const a = new Audio(url)
  a.onended = () => URL.revokeObjectURL(url)
  await a.play().catch(() => undefined)
}
