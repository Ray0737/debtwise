// Approximate Thai bank brand colours so a lender is recognisable at a glance. Unknown lenders return null.
// icon is a generic Bootstrap icon that hints at the bank type, not a logo.
// en is the value stored on a debt, so the same bank groups together in Thai and English.
export const THAI_BANKS: { en: string; th: string; icon: string; re: RegExp; bg: string; fg: string }[] = [
  { en: 'KBank', th: 'กสิกรไทย', icon: 'bank', re: /kbank|kasikorn|กสิกร/i, bg: '#138f2d', fg: '#fff' },
  { en: 'SCB', th: 'ไทยพาณิชย์', icon: 'bank2', re: /scb|siam commercial|ไทยพาณิชย์/i, bg: '#4e2a84', fg: '#fff' },
  { en: 'Bangkok Bank', th: 'กรุงเทพ', icon: 'building', re: /bangkok bank|bbl|กรุงเทพ/i, bg: '#1e4598', fg: '#fff' },
  { en: 'Krungthai', th: 'กรุงไทย', icon: 'bank', re: /krungthai|ktb|กรุงไทย/i, bg: '#1ba5e0', fg: '#fff' },
  { en: 'Krungsri', th: 'กรุงศรี', icon: 'buildings', re: /krungsri|ayudhya|กรุงศรี/i, bg: '#fec43b', fg: '#4a3600' },
  { en: 'ttb', th: 'ทหารไทยธนชาต', icon: 'bank2', re: /ttb|tmb|thanachart|ทหารไทย|ธนชาต/i, bg: '#ee6a22', fg: '#fff' },
  { en: 'GSB', th: 'ออมสิน', icon: 'piggy-bank', re: /gsb|government savings|ออมสิน/i, bg: '#eb198d', fg: '#fff' },
  { en: 'GHB', th: 'อาคารสงเคราะห์', icon: 'house-door', re: /ghb|government housing|อาคารสงเคราะห์/i, bg: '#f47920', fg: '#fff' },
  { en: 'BAAC', th: 'ธ.ก.ส.', icon: 'tree', re: /baac|ธ\.?ก\.?ส|agriculture/i, bg: '#4aa023', fg: '#fff' },
  { en: 'UOB', th: 'ยูโอบี', icon: 'building', re: /uob|ยูโอบี/i, bg: '#0b3979', fg: '#fff' },
  { en: 'CIMB Thai', th: 'ซีไอเอ็มบี ไทย', icon: 'globe2', re: /cimb|ซีไอเอ็มบี/i, bg: '#7e2f36', fg: '#fff' },
  { en: 'LH Bank', th: 'แลนด์ แอนด์ เฮ้าส์', icon: 'house-door', re: /lh bank|land and houses|แลนด์ แอนด์ เฮ้าส์/i, bg: '#1f6fb5', fg: '#fff' },
  { en: 'TISCO', th: 'ทิสโก้', icon: 'briefcase', re: /tisco|ทิสโก้/i, bg: '#12468c', fg: '#fff' },
  { en: 'KKP', th: 'เกียรตินาคินภัทร', icon: 'buildings', re: /kkp|kiatnakin|เกียรตินาคิน/i, bg: '#0f7a4f', fg: '#fff' },
  { en: 'ICBC Thai', th: 'ไอซีบีซี ไทย', icon: 'globe-asia-australia', re: /icbc|ไอซีบีซี/i, bg: '#c8102e', fg: '#fff' },
  { en: 'Islamic Bank', th: 'อิสลามแห่งประเทศไทย', icon: 'moon-stars', re: /islamic|อิสลาม/i, bg: '#1d7a46', fg: '#fff' },
  { en: 'SME D Bank', th: 'พัฒนาเอสเอ็มอี', icon: 'shop', re: /sme d|เอสเอ็มอี/i, bg: '#e8731f', fg: '#fff' },
  { en: 'Student Loan Fund', th: 'กยศ.', icon: 'mortarboard', re: /student loan|กยศ|กรอ/i, bg: '#00a0a0', fg: '#fff' },
]

export function bankColor(name: string): { background: string; color: string } | null {
  const b = THAI_BANKS.find((x) => x.re.test(name))
  return b ? { background: b.bg, color: b.fg } : null
}
