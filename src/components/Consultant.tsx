import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { useT } from '../i18n'
import { consult } from '../lib/ai'
import { buildFacts } from '../lib/facts'
import { recordOnce, speak, transcribe } from '../lib/voice'
import { useApp } from '../store/useApp'
import type { Message } from '../store/types'

type Item = Message & { flagged?: string[]; proposal?: { value: number; note: string } | null }

// The consultant is the heart of the app. Home shows it, with a notice line from the app at the top.
export function Consultant({ notice }: { notice?: string }) {
  const t = useT()
  const { store, profile, debts, lang, refresh } = useApp()
  const [items, setItems] = useState<Item[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [recording, setRecording] = useState<{ stop: () => Promise<Blob> } | null>(null)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => { void store?.listMessages().then(setItems) }, [store])
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [items])
  if (!profile || !store) return null

  const send = async (raw: string, spoken = false) => {
    const content = raw.trim()
    if (!content || busy) return
    setBusy(true); setError(false); setText('')
    try {
      const mine = await store.addMessage({ role: 'user', content })
      const history = [...items, mine]
      setItems(history)
      const r = await consult({
        messages: history.slice(-10).map((m) => ({ role: m.role, text: m.content })),
        facts: buildFacts(profile, debts), names: [profile.displayName], lang,
      })
      const saved = await store.addMessage({ role: 'assistant', content: r.reply, maskedPayload: r.maskedPayload })
      setItems([...history, { ...saved, flagged: r.flagged, proposal: r.proposal }])
      if (spoken && r.reply) void speak(r.reply)
    } catch { setError(true) } finally { setBusy(false) }
  }

  const mic = async () => {
    if (recording) {
      const blob = await recording.stop()
      setRecording(null)
      try { await send(await transcribe(blob, lang), true) } catch { setError(true) }
    } else {
      try { setRecording(await recordOnce()) } catch { setError(true) }
    }
  }

  const apply = async (value: number, i: number) => {
    await store.saveProfile({ monthlyEssentials: value })
    await refresh()
    setItems((x) => x.map((m, j) => (j === i ? { ...m, proposal: null } : m)))
  }

  return (
    <>
      {items.length === 0 && !notice && <p className="muted">{t('talk.intro')}</p>}
      <div className="chat">
        {notice && (
          <div className="msg ai"><div className="muted small">{t('talk.ai')}</div><div>{notice}</div></div>
        )}
        {items.map((m, i) => (
          <div key={m.id} className={`msg ${m.role === 'user' ? 'user' : 'ai'}`}>
            {m.role === 'assistant' && <div className="muted small">{t('talk.ai')}</div>}
            <div>{m.content}</div>
            {m.flagged && m.flagged.length > 0 && <div className="warn small" role="status"><Icon name="warn" size={16} /> {t('talk.flagged')}</div>}
            {m.proposal && (
              <div className="card" style={{ marginTop: 8 }}>
                <span className="muted small">{t('talk.proposal')}</span>
                <span>{t('field.essentials')}: <span className="num">{m.proposal.value}</span></span>
                <span className="small">{m.proposal.note}</span>
                <button className="btn btn-secondary" onClick={() => apply(m.proposal!.value, i)}>{t('talk.apply')}</button>
              </div>
            )}
          </div>
        ))}
        <div ref={end} />
      </div>
      {error && <p className="err" role="alert">{t('common.error')}</p>}
      <div className="composer">
        <label className="ctl">
          <Icon name="chat" size={16} />
          <input value={text} placeholder={t('talk.placeholder')} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(text)} />
        </label>
        <button className={`btn ${recording ? 'btn-primary' : 'btn-secondary'}`} aria-label={t('talk.mic')} aria-pressed={!!recording} onClick={mic}><Icon name="mic" size={18} /></button>
        <button className="btn btn-primary" aria-label={t('talk.send')} disabled={busy} onClick={() => send(text)}><Icon name="send" size={18} /></button>
      </div>
    </>
  )
}
