export interface Deduction {
  id: string
  maxAmount: number
  label: { th: string; en: string }
  paperwork: { th: string; en: string }
  ruleRef: string
}

// Allowances from the Revenue Department instructions for form ภ.ง.ด.91, tax year 2568.
// Each amount is the most one claim can give. Conditions (age, income, order of children) are on the form.
const ref = 'rd.go.th ภ.ง.ด.91 2568'
export const DEDUCTIONS: Deduction[] = [
  { id: 'spouse', maxAmount: 60000, label: { th: 'ค่าลดหย่อนคู่สมรส (ไม่มีเงินได้)', en: 'Spouse allowance (no income)' }, paperwork: { th: 'ทะเบียนสมรส', en: 'Marriage certificate' }, ruleRef: ref },
  { id: 'child', maxAmount: 30000, label: { th: 'ค่าลดหย่อนบุตร (ต่อคน)', en: 'Child allowance (per child)' }, paperwork: { th: 'สูติบัตร', en: 'Birth certificate' }, ruleRef: ref },
  { id: 'child2', maxAmount: 30000, label: { th: 'บุตรคนที่สองขึ้นไปที่เกิดตั้งแต่ปี 2561 (เพิ่มอีกคนละ)', en: 'Second and later child born from 2018 (extra, each)' }, paperwork: { th: 'สูติบัตร', en: 'Birth certificate' }, ruleRef: ref },
  { id: 'parents', maxAmount: 30000, label: { th: 'ค่าเลี้ยงดูบิดามารดา (ต่อคน)', en: 'Parent support (per parent)' }, paperwork: { th: 'สำเนาบัตรประชาชนของบิดามารดา', en: 'Parent ID copy' }, ruleRef: ref },
  { id: 'social_security', maxAmount: 9000, label: { th: 'เงินสมทบประกันสังคม', en: 'Social security contribution' }, paperwork: { th: 'หนังสือรับรองจากสำนักงานประกันสังคม', en: 'Social Security Office statement' }, ruleRef: ref },
  { id: 'life_insurance', maxAmount: 100000, label: { th: 'เบี้ยประกันชีวิต', en: 'Life insurance premium' }, paperwork: { th: 'ใบรับรองเบี้ยประกัน', en: 'Premium certificate' }, ruleRef: ref },
  { id: 'health_insurance', maxAmount: 25000, label: { th: 'เบี้ยประกันสุขภาพ (รวมกับประกันชีวิตไม่เกิน 100,000)', en: 'Health insurance premium (with life insurance, 100,000 at most)' }, paperwork: { th: 'ใบรับรองเบี้ยประกัน', en: 'Premium certificate' }, ruleRef: ref },
  { id: 'home_loan_interest', maxAmount: 100000, label: { th: 'ดอกเบี้ยเงินกู้ซื้อที่อยู่อาศัย', en: 'Home loan interest' }, paperwork: { th: 'หนังสือรับรองดอกเบี้ยจากธนาคาร', en: 'Bank interest certificate' }, ruleRef: ref },
  { id: 'childbirth', maxAmount: 60000, label: { th: 'ค่าฝากครรภ์และค่าคลอดบุตร (ต่อการตั้งครรภ์)', en: 'Prenatal care and childbirth (per pregnancy)' }, paperwork: { th: 'ใบเสร็จจากสถานพยาบาล', en: 'Hospital receipts' }, ruleRef: ref },
]

export function suggestDeductions(marginalRate: number) {
  const rate = Number.isFinite(marginalRate) ? Math.max(0, marginalRate) : 0
  return DEDUCTIONS.map((deduction) => ({ deduction, estimatedSaving: deduction.maxAmount * rate }))
}
