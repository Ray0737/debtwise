import { useApp } from '../store/useApp'
import { Icon } from './Icon'

export function LangToggle() {
  const { lang, setLang } = useApp()
  return (
    <button className="btn btn-text" aria-pressed={lang === 'en'} onClick={() => setLang(lang === 'th' ? 'en' : 'th')}>
      <Icon name="globe" size={20} />{lang === 'th' ? 'EN' : 'TH'}
    </button>
  )
}
