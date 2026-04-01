/**
 * Cap Rate = NOI / Property Value
 */
export function calculateCapRate(noi: number, propertyValue: number): number {
  if (propertyValue === 0) return 0;
  return noi / propertyValue;
}

/**
 * Property Value = NOI / Cap Rate
 */
export function valueFromCapRate(noi: number, capRate: number): number {
  if (capRate === 0) return 0;
  return noi / capRate;
}

/**
 * Income approach with growth rate:
 * Value = NOI / (discount_rate - growth_rate)
 */
export function incomeApproachValue(noi: number, discountRate: number, growthRate: number): number {
  const denominator = discountRate - growthRate;
  if (denominator <= 0) return 0;
  return noi / denominator;
}
