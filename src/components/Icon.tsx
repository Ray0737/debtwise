const PATHS: Record<string, string> = {
  home: 'M10 30 L32 10 L54 30 M16 26 V52 H48 V26',
  chart: 'M12 52 V12 M12 52 H54 M20 40 L30 28 L38 36 L50 18',
  doc: 'M16 8 H38 L48 18 V56 H16 Z M38 8 V18 H48 M24 30 H40 M24 40 H40',
  wallet: 'M8 18 H52 V50 H8 Z M8 18 L40 10 V18 M38 34 H52',
  person: 'M32 30 A9 9 0 1 0 32 12 A9 9 0 1 0 32 30 M12 54 C12 42 52 42 52 54',
  people: 'M24 28 A8 8 0 1 0 24 12 A8 8 0 1 0 24 28 M8 52 C8 40 40 40 40 52 M46 26 A6 6 0 1 0 46 14 M44 40 C52 38 58 44 58 52',
  mic: 'M32 10 A8 8 0 0 1 40 18 V30 A8 8 0 0 1 24 30 V18 A8 8 0 0 1 32 10 M18 28 C18 44 46 44 46 28 M32 44 V54',
  send: 'M10 32 L54 12 L40 52 L32 36 Z',
  camera: 'M10 22 H20 L24 16 H40 L44 22 H54 V50 H10 Z M32 42 A8 8 0 1 0 32 26 A8 8 0 1 0 32 42',
  upload: 'M32 44 V14 M20 26 L32 14 L44 26 M12 50 H52',
  plus: 'M32 12 V52 M12 32 H52',
  back: 'M40 12 L20 32 L40 52',
  check: 'M14 34 L26 46 L50 18',
  warn: 'M32 10 L56 52 H8 Z M32 26 V38 M32 44 V46',
  globe: 'M32 10 A22 22 0 1 0 32 54 A22 22 0 1 0 32 10 M10 32 H54 M32 10 C20 22 20 42 32 54 C44 42 44 22 32 10',
  chat: 'M10 14 H54 V42 H30 L18 52 V42 H10 Z',
  edit: 'M12 52 L16 38 L40 14 L50 24 L26 48 Z',
  bank: 'M8 26 L32 10 L56 26 H8 Z M14 30 V46 M26 30 V46 M38 30 V46 M50 30 V46 M8 52 H56',
  card: 'M8 16 H56 V48 H8 Z M8 26 H56 M16 38 H28',
  car: 'M8 38 H56 V30 L48 18 H16 L8 30 Z M20 46 A4 4 0 1 0 20 38 M44 46 A4 4 0 1 0 44 38',
  house: 'M10 30 L32 10 L54 30 M16 26 V54 H48 V26 M27 54 V38 H37 V54',
  book: 'M8 14 H28 C30 14 32 16 32 18 V54 C32 52 30 50 28 50 H8 Z M56 14 H36 C34 14 32 16 32 18 V54 C32 52 34 50 36 50 H56 Z',
  calendar: 'M10 14 H54 V54 H10 Z M10 26 H54 M22 8 V18 M42 8 V18',
  clock: 'M32 10 A22 22 0 1 0 32 54 A22 22 0 1 0 32 10 M32 20 V32 L42 38',
  percent: 'M18 46 L46 18 M20 24 A4 4 0 1 0 20 16 A4 4 0 1 0 20 24 M44 48 A4 4 0 1 0 44 40 A4 4 0 1 0 44 48',
  coins: 'M32 10 V54 M42 20 C42 14 22 14 22 24 C22 34 42 30 42 40 C42 50 22 50 22 44',
  mail: 'M8 16 H56 V48 H8 Z M8 16 L32 36 L56 16',
  tag: 'M10 10 H32 L54 32 L32 54 L10 32 Z M20 20 A2 2 0 1 0 20 22',
  bell: 'M32 10 C22 10 18 18 18 28 V38 L12 46 H52 L46 38 V28 C46 18 42 10 32 10 M26 52 A6 6 0 0 0 38 52',
  settings: 'M32 24 A8 8 0 1 0 32 40 A8 8 0 1 0 32 24 M32 8 V16 M32 48 V56 M8 32 H16 M48 32 H56 M15 15 L21 21 M43 43 L49 49 M15 49 L21 43 M43 21 L49 15',
  sun: 'M32 22 A10 10 0 1 0 32 42 A10 10 0 1 0 32 22 M32 6 V12 M32 52 V58 M6 32 H12 M52 32 H58 M14 14 L18 18 M46 46 L50 50 M14 50 L18 46 M46 18 L50 14',
}

export function Icon({ name, size = 20 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={3}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] ?? ''} />
    </svg>
  )
}

export function IconTile({ name, tone = 'soft', size = 16 }: { name: string; tone?: 'soft' | 'dark' | 'red'; size?: number }) {
  return <span className={`tile${tone === 'soft' ? '' : ` ${tone}`}`}><Icon name={name} size={size} /></span>
}
