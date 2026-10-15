import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LangToggle } from '../components/LangToggle'
import { useT } from '../i18n'
import { supabase } from '../lib/supabase'
import { useApp } from '../store/useApp'

export default function SignIn() {
  const t = useT()
  const userId = useApp((s) => s.userId)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)
  if (userId) return <Navigate to="/" replace />

  const google = () => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
  const magic = async () => {
    setError(false)
    const { error: e } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    if (e) setError(true); else setSent(true)
  }
  return (
    <div className="app" style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="main" style={{ justifyContent: 'center', paddingBottom: 20 }}>
        <div style={{ alignSelf: 'flex-end' }}><LangToggle /></div>
        <h1 className="h1">{t('app.name')}</h1>
        <p className="muted">{t('signin.line')}</p>
        <button className="btn btn-primary" onClick={google}>{t('signin.google')}</button>
        <div className="field">
          <label>{t('signin.email')}</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <button className="btn btn-secondary" disabled={!email.includes('@')} onClick={magic}>{t('signin.emailSend')}</button>
        {sent && <p role="status">{t('signin.emailSent')}</p>}
        {error && <p className="err" role="alert">{t('common.error')}</p>}
      </div>
    </div>
  )
}
