import { useEffect, useRef, useState } from 'react'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { consult } from '../lib/ai'
import { buildFacts } from '../lib/facts'
import { recordOnce, speak, transcribe } from '../lib/voice'
import type { Message } from '../store/types'
import { BOT_MEASURES } from '../data/public/botMeasures'
import { oneOffTotal, useApp } from '../store/useApp'
import { Icon } from '../ui'

type Proposal = { field: 'monthlyEssentials' | 'oneOff'; value: number; note: string }
type Item = Message & { flagged?: string[]; proposal?: Proposal | null; cites?: string[] }

export function Consultant({ notice }: { notice?: string }) {
  const t = useT()
  const { store, profile, debts, lang, refresh, oneOffs, addOneOff } = useApp()
  const [items, setItems] = useState<Item[]>([])
  const itemsRef = useRef<Item[]>([])
  const commit = (next: Item[]) => { itemsRef.current = next; setItems(next) }
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [recording, setRecording] = useState<{ stop: () => Promise<Blob> } | null>(null)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => { void store?.listMessages().then(commit) }, [store])
  useEffect(() => { if (items.length) end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [items])
  if (!profile || !store) return null

  const send = async (raw: string, spoken = false, oneOff = oneOffTotal(oneOffs)) => {
    const content = raw.trim()
    if (!content || busy) return
    setBusy(true); setError(false); setText('')
    try {
      const mine = await store.addMessage({ role: 'user', content })
      const history = [...itemsRef.current, mine]
      commit(history)
      const r = await consult({
        messages: history.slice(-10).map((m) => ({ role: m.role, text: m.content })),
        facts: buildFacts(profile, debts, oneOff), names: [profile.displayName], lang,
      })
      const saved = await store.addMessage({ role: 'assistant', content: r.reply, maskedPayload: r.maskedPayload })
      commit([...history, { ...saved, flagged: r.flagged, proposal: r.proposal, cites: r.cites }])
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

  const apply = async (pr: Proposal, i: number) => {
    commit(itemsRef.current.map((m, j) => (j === i ? { ...m, proposal: null } : m)))
    if (pr.field === 'monthlyEssentials') {
      await store.saveProfile({ monthlyEssentials: pr.value })
      await refresh()
      return
    }
    // A one-off bill changes this month only. Then ask for the updated picture with the new total.
    addOneOff({ label: pr.note, amount: pr.value })
    void send(t('talk.applied', { amount: formatBaht(pr.value), note: pr.note }), false, oneOffTotal(oneOffs) + pr.value)
  }

  return (
    <section className="stack" aria-label={t('talk.title')}>
      <div className="chat">
        {items.length === 0 && !notice && <p className="muted">{t('talk.intro')}</p>}
        {notice && <div className="msg ai"><span className="small">{t('talk.ai')}</span>{notice}</div>}
        {items.map((m, i) => (
          <div key={m.id} className={`msg ${m.role === 'user' ? 'user' : 'ai'}`}>
            {m.role === 'assistant' && <span className="small">{t('talk.ai')}</span>}
            {m.content}
            {m.flagged && m.flagged.length > 0 && <div className="small" role="status" style={{ marginTop: 4 }}><Icon n="exclamation-triangle" /> {t('talk.flagged')}</div>}
            {m.cites && m.cites.length > 0 && (
              <div className="cites small">
                <Icon n="bank" /> {t('talk.source')}:{' '}
                {m.cites.map((id) => BOT_MEASURES.find((x) => x.id === id)).filter((x) => x !== undefined).map((x) => (
                  <a key={x.id} className="link" href={x.sourceUrl} target="_blank" rel="noreferrer">{x.name[lang]}</a>
                ))}
              </div>
            )}
            {m.proposal && (
              <div className="card line" style={{ marginTop: 8 }}>
                <span className="card-title"><Icon n="pencil-square" />{t('talk.proposal')}</span>
                <span>{m.proposal.field === 'oneOff' ? t('home.oneOff') : t('field.essentials')}: <span className="num strong">{formatBaht(m.proposal.value)}</span></span>
                <span className="small muted">{m.proposal.note}</span>
                <button className="btn" onClick={() => apply(m.proposal!, i)}>{t('talk.apply')}</button>
              </div>
            )}
          </div>
        ))}
        <div ref={end} />
      </div>
      {error && <p className="err" role="alert">{t('common.error')}</p>}
      <div className="composer">
        <div className="composer-box">
          <Icon n="chat-dots" />
          <input id="chat-input" value={text} placeholder={t('talk.placeholder')} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(text)} />
          <button className={`cbtn ${recording ? 'rec' : ''}`} aria-label={t('talk.mic')} aria-pressed={!!recording} onClick={mic}><Icon n={recording ? 'stop-fill' : 'mic-fill'} /></button>
          <button className="cbtn send" aria-label={t('talk.send')} disabled={busy || !text.trim()} onClick={() => send(text)}><Icon n="arrow-up" /></button>
        </div>
      </div>
    </section>
  )
}
