const PATHS: Record<string, string> = {
  home: 'M10 30 L32 10 L54 30 M16 26 V52 H48 V26',
  chart: 'M12 52 V12 M12 52 H54 M20 40 L30 28 L38 36 L50 18',
  doc: 'M16 8 H38 L48 18 V56 H16 Z M38 8 V18 H48 M24 30 H40 M24 40 H40',
  wallet: 'M8 18 H52 V50 H8 Z M8 18 L40 10 V18 M38 34 H52',
  person: 'M32 30 A9 9 0 1 0 32 12 A9 9 0 1 0 32 30 M12 54 C12 42 52 42 52 54',
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
}

export function Icon({ name, size = 24 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2.6}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] ?? ''} />
    </svg>
  )
}
