// Public Bank of Thailand debt relief measures, read from the official page on 2026-10-15.
// Source: https://www.bot.or.th/th/debtsolution/debtsolution-measure.html
// Wording is a short summary. Check the page before showing any term as a promise to a user.
export interface DebtMeasure {
  id: string
  name: { th: string; en: string }
  who: { th: string; en: string }
  terms: { th: string; en: string }
  sourceUrl: string
  asOf: string
}

const sourceUrl = 'https://www.bot.or.th/th/debtsolution/debtsolution-measure.html'
const asOf = '2026-10-15'

export const BOT_MEASURES: DebtMeasure[] = [
  {
    id: 'restructure', sourceUrl, asOf,
    name: { th: 'ขอปรับโครงสร้างหนี้ตั้งแต่ยังไม่เป็นหนี้เสีย', en: 'Restructure before a loan turns non-performing' },
    who: { th: 'ลูกหนี้รายย่อยและ SME ที่มีสินเชื่อบ้าน บัตรเครดิต สินเชื่อส่วนบุคคล นาโนไฟแนนซ์ หรือสินเชื่อจำนำทะเบียน', en: 'Retail borrowers and SMEs with home, credit card, personal, nano or car-title loans' },
    terms: { th: 'ขอได้ทั้งก่อนและหลังเป็นหนี้เสีย เจ้าหนี้ต้องให้เวลาอย่างน้อย 60 วันพิจารณาแผนก่อนขายหนี้ เงื่อนไขเช่นขยายงวดหรือผ่อนน้อยช่วงแรกขึ้นกับเจ้าหนี้', en: 'Can be requested before or after a loan turns non-performing. The creditor must allow at least 60 days to consider a plan before selling the debt. Longer terms or lower early instalments are the creditor’s decision.' },
  },
  {
    id: 'debt-clinic', sourceUrl, asOf,
    name: { th: 'โครงการคลินิกแก้หนี้', en: 'Debt Clinic' },
    who: { th: 'หนี้บัตรเครดิต บัตรกดเงินสด หรือสินเชื่อส่วนบุคคลที่ค้างเกิน 120 วัน มีรายได้ อายุไม่เกิน 70 ปี และไม่ล้มละลาย', en: 'Credit card, cash card or personal loans overdue more than 120 days; has income, under 70, not bankrupt' },
    terms: { th: 'รวมหนี้หลายเจ้าหนี้ได้ถ้ารวมไม่เกิน 2 ล้านบาท ดอกเบี้ย 3 ถึง 5 ต่อปี ผ่อนได้สูงสุด 10 ปี', en: 'Debts from several creditors can be combined if the total is at most 2 million baht. Interest 3 to 5 percent a year, up to 10 years.' },
  },
  {
    id: 'chronic-close', sourceUrl, asOf,
    name: { th: 'โครงการปิดจบหนี้เรื้อรัง', en: 'Chronic debt close-out' },
    who: { th: 'หนี้บัตรที่จ่ายดอกเบี้ยเกินเงินต้นมานานกว่า 5 ปี ไม่เป็นหนี้เสีย รายได้ต่ำกว่า 10,000 บาท (นอกธนาคาร) หรือ 20,000 บาท (ธนาคาร)', en: 'Card debt where interest has exceeded principal for over 5 years, not non-performing, income under 10,000 baht (non-bank) or 20,000 baht (bank)' },
    terms: { th: 'แปลงเป็นผ่อนชำระได้สูงสุด 5 ปี ดอกเบี้ยไม่เกิน 15 ต่อปี เจ้าหนี้แจ้งลูกหนี้ที่เข้าเกณฑ์เอง', en: 'Converted to instalments of up to 5 years with interest capped at 15 percent a year. Creditors notify eligible borrowers.' },
  },
  {
    id: 'chronic-early', sourceUrl, asOf,
    name: { th: 'ขอความช่วยเหลือเมื่อเริ่มเป็นหนี้เรื้อรัง', en: 'Early help for chronic debt' },
    who: { th: 'ลูกหนี้ที่จ่ายดอกเบี้ยเกินเงินต้นมานานกว่า 3 ปี', en: 'Borrowers whose interest has exceeded principal for over 3 years' },
    terms: { th: 'เจรจากับเจ้าหนี้เพื่อปิดหนี้เร็วขึ้นก่อนจะจ่ายไม่ไหว', en: 'Negotiate faster repayment with the creditor before payments become impossible.' },
  },
  {
    id: 'no-prepay-fee', sourceUrl, asOf,
    name: { th: 'ไม่คิดค่าปรับชำระหนี้ก่อนกำหนด', en: 'No prepayment fee' },
    who: { th: 'สินเชื่อรายย่อยทุกประเภท', en: 'All retail loan types' },
    terms: { th: 'ยกเว้นการรีไฟแนนซ์สินเชื่อบ้านภายใน 3 ปีแรกของสัญญา', en: 'Exception: home loan refinancing within the first 3 years of the contract.' },
  },
  {
    id: 'no-restructure-fee', sourceUrl, asOf,
    name: { th: 'ไม่คิดค่าธรรมเนียมปรับโครงสร้างหนี้', en: 'No restructuring fee' },
    who: { th: 'สินเชื่อรายย่อยและ SME', en: 'Retail and SME loans' },
    terms: { th: 'ยกเว้นกรณีเจ้าหนี้ต้องประเมินหลักประกันเพิ่มเพื่อกำหนดเงื่อนไข', en: 'Exception: when the creditor needs an extra collateral appraisal to set the terms.' },
  },
  {
    id: 'no-interest-on-interest', sourceUrl, asOf,
    name: { th: 'ไม่คิดดอกเบี้ยบนดอกเบี้ย', en: 'No interest on interest' },
    who: { th: 'สินเชื่อรายย่อยทุกประเภท รวมบัญชีเบิกเกินบัญชี', en: 'All retail loan types, including overdraft accounts' },
    terms: { th: 'มีผลตั้งแต่ 1 กรกฎาคม 2567', en: 'In effect since 1 July 2024.' },
  },
]
