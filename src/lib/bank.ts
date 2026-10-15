// Approximate Thai bank brand colours so a lender is recognisable at a glance. Unknown lenders return null.
const BANKS: { re: RegExp; bg: string; fg: string }[] = [
  { re: /kbank|kasikorn|กสิกร/i, bg: '#138f2d', fg: '#fff' },
  { re: /scb|siam commercial|ไทยพาณิชย์/i, bg: '#4e2a84', fg: '#fff' },
  { re: /bangkok bank|bbl|กรุงเทพ/i, bg: '#1e4598', fg: '#fff' },
  { re: /krungthai|ktb|กรุงไทย/i, bg: '#1ba5e0', fg: '#fff' },
  { re: /krungsri|ayudhya|กรุงศรี/i, bg: '#fec43b', fg: '#4a3600' },
  { re: /ttb|tmb|thanachart|ทหารไทย|ธนชาต/i, bg: '#ee6a22', fg: '#fff' },
  { re: /gsb|government savings|ออมสิน/i, bg: '#eb198d', fg: '#fff' },
  { re: /ghb|government housing|อาคารสงเคราะห์/i, bg: '#f47920', fg: '#fff' },
  { re: /baac|ธ\.?ก\.?ส|agriculture/i, bg: '#4aa023', fg: '#fff' },
  { re: /uob|ยูโอบี/i, bg: '#0b3979', fg: '#fff' },
  { re: /cimb|ซีไอเอ็มบี/i, bg: '#7e2f36', fg: '#fff' },
  { re: /lh bank|land and houses|แลนด์ แอนด์ เฮ้าส์/i, bg: '#1f6fb5', fg: '#fff' },
  { re: /student loan|กยศ|กรอ/i, bg: '#00a0a0', fg: '#fff' },
]

export function bankColor(name: string): { background: string; color: string } | null {
  const b = BANKS.find((x) => x.re.test(name))
  return b ? { background: b.bg, color: b.fg } : null
}
