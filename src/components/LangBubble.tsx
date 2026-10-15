import { useApp } from '../store/useApp'
import { Icon } from './Icon'

// Circle language switcher, pinned to the top right of the page frame.
export function LangBubble() {
  const { lang, setLang } = useApp()
  return (
    <button className="lang-bubble" aria-label={lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'} onClick={() => setLang(lang === 'th' ? 'en' : 'th')}>
      <Icon name="globe" size={14} />
      <span>{lang === 'th' ? 'EN' : 'TH'}</span>
    </button>
  )
}
