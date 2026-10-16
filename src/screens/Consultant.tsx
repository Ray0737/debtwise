import { useEffect, useRef, useState } from 'react'
import { formatBaht } from '../engine'
import { useT } from '../i18n'
import { consult } from '../lib/ai'
import { loadBreaks, saveBreaks, splitSessions } from '../lib/chatSessions'
import { buildFacts } from '../lib/facts'
import { recordOnce, speak, transcribe } from '../lib/voice'
import type { Message } from '../store/types'
import { BOT_MEASURES } from '../data/public/botMeasures'
import { oneOffTotal, useApp } from '../store/useApp'
import { Icon, Row } from '../ui'

type Proposal = { field: 'monthlyEssentials' | 'oneOff'; value: number; note: string }
type Item = Message & { flagged?: string[]; proposal?: Proposal | null; cites?: string[] }

export function Consultant({ notice }: { notice?: string }) {
  const t = useT()
  const { store, profile, debts, lang, refresh, oneOffs, addOneOff } = useApp()
  // items holds every saved message. The screen and the history sent to the AI use the current chat only.
  const [items, setItems] = useState<Item[]>([])
  const itemsRef = useRef<Item[]>([])
  const commit = (next: Item[]) => { itemsRef.current = next; setItems(next) }
  const [breaks, setBreaks] = useState(loadBreaks)
  const [viewing, setViewing] = useState<number | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [q, setQ] = useState('')
  const sessions = splitSessions(items, breaks)
  const current = sessions.at(-1)!
  const shown = viewing === null ? current : sessions[viewing] ?? current
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [recording, setRecording] = useState<{ stop: () => Promise<Blob> } | null>(null)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => { void store?.listMessages(500).then(commit) }, [store])
  useEffect(() => { if (shown.length) end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [shown.length])
  if (!profile || !store) return null

  const send = async (raw: string, spoken = false, oneOff = oneOffTotal(oneOffs)) => {
    const content = raw.trim()
    if (!content || busy) return
    setBusy(true); setError(false); setText('')
    try {
      const mine = await store.addMessage({ role: 'user', content })
      const history = [...splitSessions(itemsRef.current, breaks).at(-1)!, mine]
      commit([...itemsRef.current, mine])
      const r = await consult({
        messages: history.slice(-10).map((m) => ({ role: m.role, text: m.content })),
        facts: buildFacts(profile, debts, oneOff), names: [profile.displayName], lang,
      })
      const saved = await store.addMessage({ role: 'assistant', content: r.reply, maskedPayload: r.maskedPayload })
      commit([...itemsRef.current, { ...saved, flagged: r.flagged, proposal: r.proposal, cites: r.cites }])
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

  const apply = async (pr: Proposal, id: string) => {
    commit(itemsRef.current.map((m) => (m.id === id ? { ...m, proposal: null } : m)))
    if (pr.field === 'monthlyEssentials') {
      await store.saveProfile({ monthlyEssentials: pr.value })
      await refresh()
      return
    }
    // A one-off bill changes this month only. Then ask for the updated picture with the new total.
    addOneOff({ label: pr.note, amount: pr.value })
    void send(t('talk.applied', { amount: formatBaht(pr.value), note: pr.note }), false, oneOffTotal(oneOffs) + pr.value)
  }

  const hhmm = (iso: string) => {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-GB', { hour: '2-digit', minute: '2-digit' })
  }
  const newChat = () => {
    const last = items.at(-1)
    if (!last || !current.length) return
    const next = [...breaks, last.createdAt]
    saveBreaks(next); setBreaks(next); setViewing(null); setShowHistory(false); setError(false)
  }
  const all = sessions.map((msgs, idx) => ({ msgs, idx })).filter((x) => x.msgs.length).reverse()
  const day = (iso: string) => new Date(iso).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  const Avatar = () => <span className="bot" aria-hidden="true"><Icon n="robot" /></span>

  if (showHistory) {
    const open = (idx: number) => { setViewing(idx === sessions.length - 1 ? null : idx); setShowHistory(false) }
    const needle = q.trim().toLowerCase()
    const list = all.filter((x) => !needle || x.msgs.some((m) => m.content.toLowerCase().includes(needle)))
    const dayKey = (iso: string) => Math.round((new Date().setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86_400_000)
    const groupOf = (iso: string) => (dayKey(iso) <= 0 ? 'talk.today' : dayKey(iso) === 1 ? 'talk.yesterday' : 'talk.earlier') as 'talk.today' | 'talk.yesterday' | 'talk.earlier'
    const groups = (['talk.today', 'talk.yesterday', 'talk.earlier'] as const).map((g) => ({ g, rows: list.filter((x) => groupOf(x.msgs.at(-1)!.createdAt) === g) })).filter((x) => x.rows.length)
    const chatCount = all.length
    const msgCount = all.reduce((n, x) => n + x.msgs.length, 0)
    return (
      <section className="chatlist" aria-label={t('talk.history')}>
        <div className="histhead">
          <button className="circle" aria-label={t('common.back')} onClick={() => setShowHistory(false)}><Icon n="chevron-left" /></button>
          <h2>{t('talk.history')}</h2>
          <span className="badge out"><Icon n="chat-dots" />{t('talk.histCount', { chats: chatCount, msgs: msgCount })}</span>
        </div>
        {chatCount > 0 && (
          <div className="histsearch">
            <Icon n="search" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('talk.histSearch')} aria-label={t('talk.histSearch')} />
          </div>
        )}
        {chatCount === 0 && (
          <div className="histempty"><span className="bigdot"><Icon n="clock-history" /></span><p className="muted">{t('talk.historyEmpty')}</p></div>
        )}
        {chatCount > 0 && list.length === 0 && <p className="muted">{t('talk.histNone')}</p>}
        {groups.map(({ g, rows }) => (
          <div key={g} className="histgroup">
            <span className="small muted histlabel">{t(g)}</span>
            {rows.map(({ msgs, idx }) => {
              const isCur = idx === sessions.length - 1
              const first = (msgs.find((m) => m.role === 'user') ?? msgs[0]).content
              const reply = [...msgs].reverse().find((m) => m.role === 'assistant')?.content
              return (
                <Row key={idx} icon={isCur ? 'chat-dots-fill' : 'chat-left-text'} title={first.slice(0, 80)} sub={reply ? reply.slice(0, 90) : undefined} onClick={() => open(idx)}>
                  <span className="small muted histmeta">
                    {isCur && <span className="badge fill">{t('talk.current')}</span>}
                    <span><Icon n="clock" /> {day(msgs[0].createdAt)}</span>
                    <span><Icon n="chat" /> {msgs.length}</span>
                  </span>
                </Row>
              )
            })}
          </div>
        ))}
      </section>
    )
  }
  return (
    <section className="chatlist" aria-label={t('talk.title')}>
      {viewing !== null && (
        <button className="btn soft" onClick={() => setViewing(null)}><Icon n="chevron-left" /> {t('talk.backCurrent')}</button>
      )}
      {shown.length === 0 && !notice && <p className="muted">{t('talk.intro')}</p>}
      {notice && viewing === null && (
        <div className="mrow ai">
          <Avatar />
          <div className="col1"><div className="bub ai">{notice}</div></div>
        </div>
      )}
      {shown.map((m) => (
        <div key={m.id} className={`mrow ${m.role === 'user' ? 'user' : 'ai'}`}>
          {m.role === 'assistant' && <Avatar />}
          <div className="col1">
            <div className={`bub ${m.role === 'user' ? 'user' : 'ai'}`}>
              {m.content}
              {m.flagged && m.flagged.length > 0 && <div className="small" role="status" style={{ marginTop: 4 }}><Icon n="exclamation-triangle" /> {t('talk.flagged')}</div>}
              {m.proposal && (
                <div className="card line proposal">
                  <span className="card-title"><Icon n="pencil-square" />{t('talk.proposal')}</span>
                  <span>{m.proposal.field === 'oneOff' ? t('home.oneOff') : t('field.essentials')}: <span className="num strong">{formatBaht(m.proposal.value)}</span></span>
                  <span className="small muted">{m.proposal.note}</span>
                  <button className="btn" onClick={() => apply(m.proposal!, m.id)}>{t('talk.apply')}</button>
                </div>
              )}
            </div>
            {m.cites && m.cites.length > 0 && (
              <div className="cites small">
                <Icon n="bank" /> {t('talk.source')}:{' '}
                {m.cites.map((id) => BOT_MEASURES.find((x) => x.id === id)).filter((x) => x !== undefined).map((x) => (
                  <a key={x.id} className="link" href={x.sourceUrl} target="_blank" rel="noreferrer">{x.name[lang]}</a>
                ))}
              </div>
            )}
            {hhmm(m.createdAt) && <span className="mtime">{hhmm(m.createdAt)}</span>}
          </div>
        </div>
      ))}
      {busy && (
        <div className="mrow ai"><Avatar /><div className="col1"><div className="bub ai typing" aria-label={t('common.loading')}><i /><i /><i /></div></div></div>
      )}
      {error && <p className="err" role="alert">{t('common.error')}</p>}
      <div ref={end} className="chatend" />
      {viewing === null && <div className="composer">
        <div className="col">
          <div className="composer-box">
            <button className="cbtn tool" aria-label={t('talk.new')} title={t('talk.new')} disabled={!current.length} onClick={newChat}><Icon n="plus-lg" /></button>
            <button className="cbtn tool" aria-label={t('talk.history')} title={t('talk.history')} aria-expanded={showHistory} onClick={() => setShowHistory(!showHistory)}><Icon n="clock-history" /></button>
            <input id="chat-input" value={text} placeholder={t('talk.placeholder')} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(text)} />
            <button className={`cbtn ${recording ? 'rec' : ''}`} aria-label={t('talk.mic')} aria-pressed={!!recording} onClick={mic}><Icon n={recording ? 'stop-fill' : 'mic-fill'} /></button>
            <button className="cbtn send" aria-label={t('talk.send')} disabled={busy || !text.trim()} onClick={() => send(text)}><Icon n="send-fill" /></button>
          </div>
        </div>
      </div>}
    </section>
  )
}
