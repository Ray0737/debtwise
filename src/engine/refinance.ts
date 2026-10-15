export interface Offer {
  id: string
  bank: string
  ratePct: number
  termMonths: number
  fee: number
  penalty: number
  insuranceMonthly: number
}
export interface RefinanceResult {
  currentPayment: number
  newPayment: number
  currentTotal: number
  newTotal: number
  saving: number
  worthIt: boolean
  termChangeMonths: number
  longerTerm: boolean
}

export function annuity(principal: number, ratePct: number, months: number): number {
  const r = ratePct / 1200
  if (r === 0) return principal / months
  return (principal * r) / (1 - Math.pow(1 + r, -months))
}

export function refinance(input: {
  balance: number
  currentRatePct: number
  termMonthsLeft: number
  offer: Offer
}): RefinanceResult {
  const { balance, currentRatePct, termMonthsLeft, offer } = input
  if (!(termMonthsLeft > 0)) throw new Error('termMonthsLeft must be above 0')
  const currentPayment = annuity(balance, currentRatePct, termMonthsLeft)
  const currentTotal = currentPayment * termMonthsLeft
  const newPayment = annuity(balance, offer.ratePct, offer.termMonths)
  const newTotal =
    newPayment * offer.termMonths + offer.insuranceMonthly * offer.termMonths + offer.fee + offer.penalty
  const saving = currentTotal - newTotal
  return {
    currentPayment,
    newPayment,
    currentTotal,
    newTotal,
    saving,
    worthIt: saving > 0,
    termChangeMonths: offer.termMonths - termMonthsLeft,
    longerTerm: offer.termMonths > termMonthsLeft,
  }
}
