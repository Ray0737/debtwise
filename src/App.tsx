import { useEffect, type ReactElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { useT } from './i18n'
import { useApp } from './store/useApp'

const Todo = ({ name }: { name: string }) => <p className="muted">{name}</p>

function Guard({ children }: { children: ReactElement }) {
  const { ready, userId, profile } = useApp()
  const t = useT()
  if (!ready) return <p className="muted" style={{ padding: 20 }}>{t('common.loading')}</p>
  if (!userId) return <Navigate to="/signin" replace />
  if (!profile?.onboardedAt) return <Navigate to="/onboarding/1" replace />
  return children
}

export default function App() {
  const init = useApp((s) => s.init)
  const lang = useApp((s) => s.lang)
  useEffect(() => { void init() }, [init])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<Todo name="signin" />} />
        <Route path="/onboarding/:step" element={<Todo name="onboarding" />} />
        <Route element={<Guard><Shell /></Guard>}>
          <Route index element={<Todo name="home" />} />
          <Route path="invest" element={<Todo name="invest" />} />
          <Route path="tax" element={<Todo name="tax" />} />
          <Route path="debt" element={<Todo name="debt" />} />
          <Route path="profile" element={<Todo name="profile" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
