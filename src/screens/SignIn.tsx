import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Field, TextInput } from '../components/Field'
import { Icon } from '../components/Icon'
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
    <div className="app" style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="main" style={{ justifyContent: 'center', paddingBottom: 16 }}>
        <div style={{ alignSelf: 'flex-end' }}><LangToggle /></div>
        <span className="brand" style={{ fontSize: 22 }}><span className="brand-mark" style={{ width: 34, height: 34 }}><Icon name="check" size={20} /></span>{t('app.name')}</span>
        <p className="muted">{t('signin.line')}</p>
        <button className="btn btn-primary" onClick={google}><Icon name="globe" size={16} />{t('signin.google')}</button>
        <Field label={t('signin.email')}>
          <TextInput icon="mail" type="email" autoComplete="email" placeholder={t('ph.email')} value={email} onChange={setEmail} />
        </Field>
        <button className="btn btn-secondary" disabled={!email.includes('@')} onClick={magic}>{t('signin.emailSend')}</button>
        {sent && <p role="status">{t('signin.emailSent')}</p>}
        {error && <p className="err" role="alert">{t('common.error')}</p>}
      </div>
    </div>
  )
}
