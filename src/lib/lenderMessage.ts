import { formatBaht, type Debt, type Lang } from '../engine'

// A plain request to restructure, filled with the person's own numbers. No AI: nothing is invented.
export function buildLenderMessage(i: { lang: Lang; name: string; debt: Debt; available: number; minimums: number; shortfall: number }): string {
  const { lang, name, debt: d } = i
  const who = name.trim() || (lang === 'th' ? '[ชื่อของฉัน]' : '[my name]')
  if (lang === 'th') {
    return [
      `เรียน ${d.lender}`,
      '',
      `เรื่อง ขอปรับโครงสร้างหนี้ ${d.label}`,
      '',
      `ข้าพเจ้า ${who} มี ${d.label} กับ${d.lender} ยอดคงเหลือ ${formatBaht(d.balance)} ยอดชำระขั้นต่ำ ${formatBaht(d.minPayment)} ต่อเดือน${d.dueDay ? ` ครบกำหนดวันที่ ${d.dueDay} ของเดือน` : ''}`,
      '',
      `เดือนนี้ หลังหักค่าใช้จ่ายที่จำเป็นต่อการดำรงชีพและภาษีที่ต้องกันไว้ ข้าพเจ้ามีเงินสำหรับชำระหนี้ ${formatBaht(i.available)} ในขณะที่ยอดชำระขั้นต่ำรวมของทุกรายการคือ ${formatBaht(i.minimums)} จึงขาดอยู่ ${formatBaht(i.shortfall)}`,
      '',
      'ข้าพเจ้าทราบว่าลูกหนี้สามารถขอปรับโครงสร้างหนี้ได้ก่อนที่หนี้จะเป็นหนี้เสีย จึงขอปรึกษาทางเลือก เช่น การขยายระยะเวลาผ่อนหรือการลดยอดผ่อนในช่วงแรก เพื่อให้ชำระได้ต่อเนื่องโดยไม่ผิดนัด',
      '',
      'ข้าพเจ้ายินดีส่งเอกสารที่จำเป็น และขอทราบเอกสารที่ต้องใช้ รวมถึงช่องทางและผู้ที่ข้าพเจ้าควรติดต่อ ขอบคุณที่พิจารณา',
      '',
      who,
    ].join('\n')
  }
  return [
    `Dear ${d.lender},`,
    '',
    `Subject: Request to restructure my ${d.label}`,
    '',
    `I am ${who}. I have a ${d.label} with you, balance ${formatBaht(d.balance)}, minimum payment ${formatBaht(d.minPayment)} a month${d.dueDay ? `, due on day ${d.dueDay} of the month` : ''}.`,
    '',
    `This month, after essential living costs and tax I must set aside, I have ${formatBaht(i.available)} for debt, while the minimum payments on all my loans add up to ${formatBaht(i.minimums)}. I am short by ${formatBaht(i.shortfall)}.`,
    '',
    'I understand borrowers can ask to restructure before a loan becomes non-performing, so I would like to discuss options such as a longer term or lower early instalments, so that I can keep paying without missing a payment.',
    '',
    'I am glad to send any documents you need. Please tell me which ones, and who I should contact. Thank you for considering this.',
    '',
    who,
  ].join('\n')
}
