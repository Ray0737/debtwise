// Bootstrap Icons, installed from npm and bundled locally. Names here are the app's own, mapped to icon classes.
const MAP: Record<string, string> = {
  home: 'house',
  chart: 'graph-up',
  doc: 'file-earmark-text',
  wallet: 'wallet2',
  person: 'person',
  people: 'people',
  mic: 'mic',
  send: 'send',
  camera: 'camera',
  upload: 'upload',
  plus: 'plus-lg',
  back: 'chevron-left',
  check: 'check-lg',
  warn: 'exclamation-triangle',
  globe: 'globe2',
  chat: 'chat-dots',
  edit: 'pencil',
  bank: 'bank',
  card: 'credit-card',
  car: 'car-front',
  house: 'house-door',
  book: 'book',
  calendar: 'calendar3',
  clock: 'clock',
  percent: 'percent',
  coins: 'coin',
  mail: 'envelope',
  tag: 'tag',
  bell: 'bell',
  settings: 'gear',
  sun: 'sun',
}

export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return <i className={`bi bi-${MAP[name] ?? name}`} style={{ fontSize: size, lineHeight: 1 }} aria-hidden="true" />
}

export function IconTile({ name, tone = 'soft', size = 16 }: { name: string; tone?: 'soft' | 'dark' | 'red'; size?: number }) {
  return <span className={`tile${tone === 'soft' ? '' : ` ${tone}`}`}><Icon name={name} size={size} /></span>
}
