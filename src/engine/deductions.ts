export interface Deduction {
  id: string
  maxAmount: number
  label: { th: string; en: string }
  paperwork: { th: string; en: string }
  ruleRef: string
}

// Sample list. Amounts and rules must be verified against the Revenue Department before showing as fact.
export const DEDUCTIONS: Deduction[] = [
  { id: 'spouse', maxAmount: 60000, label: { th: 'ค่าลดหย่อนคู่สมรส', en: 'Spouse allowance' }, paperwork: { th: 'ทะเบียนสมรส', en: 'Marriage certificate' }, ruleRef: 'sample' },
  { id: 'child', maxAmount: 30000, label: { th: 'ค่าลดหย่อนบุตร (ต่อคน)', en: 'Child allowance (per child)' }, paperwork: { th: 'สูติบัตร', en: 'Birth certificate' }, ruleRef: 'sample' },
  { id: 'parents', maxAmount: 30000, label: { th: 'ค่าเลี้ยงดูบิดามารดา (ต่อคน)', en: 'Parent support (per parent)' }, paperwork: { th: 'สำเนาบัตรประชาชนของบิดามารดา', en: 'Parent ID copy' }, ruleRef: 'sample' },
  { id: 'social_security', maxAmount: 9000, label: { th: 'เงินสมทบประกันสังคม', en: 'Social security contribution' }, paperwork: { th: 'หนังสือรับรองจากสำนักงานประกันสังคม', en: 'Social Security Office statement' }, ruleRef: 'sample' },
  { id: 'life_insurance', maxAmount: 100000, label: { th: 'เบี้ยประกันชีวิต', en: 'Life insurance premium' }, paperwork: { th: 'ใบรับรองเบี้ยประกัน', en: 'Premium certificate' }, ruleRef: 'sample' },
  { id: 'home_loan_interest', maxAmount: 100000, label: { th: 'ดอกเบี้ยเงินกู้ซื้อที่อยู่อาศัย', en: 'Home loan interest' }, paperwork: { th: 'หนังสือรับรองดอกเบี้ยจากธนาคาร', en: 'Bank interest certificate' }, ruleRef: 'sample' },
]

export function suggestDeductions(marginalRate: number) {
  const rate = Number.isFinite(marginalRate) ? Math.max(0, marginalRate) : 0
  return DEDUCTIONS.map((deduction) => ({ deduction, estimatedSaving: deduction.maxAmount * rate }))
}
