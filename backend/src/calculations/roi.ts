/**
 * Simple ROI = (Total Gain - Total Cost) / Total Cost
 */
export function calculateROI(totalGain: number, totalCost: number): number {
  if (totalCost === 0) return 0;
  return (totalGain - totalCost) / totalCost;
}

/**
 * Annualized ROI given simple ROI and number of months
 */
export function annualizedROI(simpleROI: number, months: number): number {
  if (months <= 0) return 0;
  return Math.pow(1 + simpleROI, 12 / months) - 1;
}
