import '@fontsource-variable/inter'
import 'bootstrap-icons/font/bootstrap-icons.min.css'
import './styles.css'
import { createRoot } from 'react-dom/client'

const root = createRoot(document.getElementById('root')!)

// Vite bakes VITE_* values in at build time. Without them the app cannot talk to Supabase,
// so show what is missing instead of a blank page.
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  root.render(
    <div className="center" style={{ padding: 24, textAlign: 'center', flexDirection: 'column', gap: 8 }}>
      <strong>Debtwise is not configured</strong>
      <span className="small">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the project environment variables, then build again.</span>
    </div>,
  )
} else {
  void import('./App').then(({ default: App }) => root.render(<App />))
}
