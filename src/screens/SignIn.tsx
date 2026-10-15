import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useT } from '../i18n'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/useApp'
import { PublicDock } from '../site/Site'
import { Field, Icon, Page, TextInput } from '../ui'

export default function SignIn() {
  const t = useT()
  const { ready, userId } = useApp()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  if (ready && userId) return <Navigate to="/" replace />

  const google = async () => {
    setError(false)
    const { error: e } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
    if (e) setError(true)
  }
  const mail = async () => {
    setBusy(true); setError(false)
    const { error: e } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin } })
    setBusy(false)
    if (e) setError(true); else setSent(true)
  }

  return (
    <main className="main solo half pubdock">
      <Page title={t('app.name')} back="/" hero={<><span className="big">{t('signin.title')}</span><span className="small">{t('signin.line')}</span></>}>
        <button className="btn block" onClick={google}><Icon n="google" />{t('signin.google')}</button>
        <div className="between muted small"><span className="sep grow" />{t('common.or')}<span className="sep grow" /></div>
        <Field label={t('signin.email')}>
          <TextInput type="email" value={email} onChange={setEmail} placeholder={t('ph.email')} />
        </Field>
        <button className="btn soft block" disabled={busy || !/^\S+@\S+\.\S+$/.test(email.trim())} onClick={mail}><Icon n="envelope" />{t('signin.emailSend')}</button>
        {sent && <p className="small" role="status"><Icon n="check-circle" /> {t('signin.emailSent')}</p>}
        {error && <p className="err" role="alert">{t('common.error')}</p>}
      </Page>
      <PublicDock />
    </main>
  )
}
