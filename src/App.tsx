import { useEffect, type ReactElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { useT } from './i18n'
import { useApp } from './store/useApp'
import SignIn from './screens/SignIn'
import Onboarding from './screens/Onboarding'
import ProfileScreen from './screens/Profile'
import Debt from './screens/Debt'
import DebtGroup from './screens/DebtGroup'
import LoanDetail from './screens/LoanDetail'
import AddDebt from './screens/AddDebt'
import Review from './screens/Review'
import Plan from './screens/Plan'
import Home from './screens/Home'
import Invest from './screens/Invest'
import Tax from './screens/Tax'

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
        <Route path="/signin" element={<SignIn />} />
        <Route path="/onboarding/:step" element={<Onboarding />} />
        <Route element={<Guard><Shell /></Guard>}>
          <Route index element={<Home />} />
          <Route path="invest" element={<Invest />} />
          <Route path="tax" element={<Tax />} />
          <Route path="talk" element={<Navigate to="/" replace />} />
          <Route path="debt" element={<Debt />} />
          <Route path="debt/add" element={<AddDebt />} />
          <Route path="debt/review" element={<Review />} />
          <Route path="plan" element={<Plan />} />
          <Route path="debt/group/:by/:key" element={<DebtGroup />} />
          <Route path="debt/loan/:id" element={<LoanDetail />} />
          <Route path="profile" element={<ProfileScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
