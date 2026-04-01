import { generateCashFlows } from './cashFlow';
import { calculateIRR, annualizeIRR } from './irr';
import { calculateROI } from './roi';

export interface SensitivityParams {
  totalInvestment: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  projectionMonths: number;
  salePrice: number;
  saleMonth: number | null;
  variable_x: 'sale_price' | 'construction_cost' | 'monthly_revenue' | 'cap_rate';
  variable_y: 'sale_price' | 'construction_cost' | 'monthly_revenue' | 'cap_rate';
  steps?: number;
  range_pct?: number;
}

/**
 * Generate a sensitivity matrix by perturbing two variables.
 * Returns IRR and ROI matrices for each combination.
 */
export function sensitivityAnalysis(params: SensitivityParams) {
  const steps = params.steps || 5;
  const rangePct = params.range_pct || 0.20;

  const xValues: number[] = [];
  const yValues: number[] = [];

  for (let i = -steps; i <= steps; i++) {
    const pct = 1 + (i / steps) * rangePct;
    xValues.push(pct);
    yValues.push(pct);
  }

  const irrMatrix: (number | null)[][] = [];
  const roiMatrix: number[][] = [];

  for (const yMult of yValues) {
    const irrRow: (number | null)[] = [];
    const roiRow: number[] = [];

    for (const xMult of xValues) {
      const adjusted = { ...params };

      // Apply X variable multiplier
      applyMultiplier(adjusted, params.variable_x, xMult);
      // Apply Y variable multiplier
      applyMultiplier(adjusted, params.variable_y, yMult);

      const cashFlows = generateCashFlows({
        totalInvestment: adjusted.totalInvestment,
        monthlyRevenue: adjusted.monthlyRevenue,
        monthlyExpenses: adjusted.monthlyExpenses,
        projectionMonths: adjusted.projectionMonths,
        salePrice: adjusted.salePrice,
        saleMonth: adjusted.saleMonth,
      });

      const monthlyIRR = calculateIRR(cashFlows);
      const irr = monthlyIRR !== null ? annualizeIRR(monthlyIRR) : null;

      const totalGain = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0);
      const roi = calculateROI(totalGain, adjusted.totalInvestment);

      irrRow.push(irr);
      roiRow.push(roi);
    }

    irrMatrix.push(irrRow);
    roiMatrix.push(roiRow);
  }

  return {
    variable_x: params.variable_x,
    variable_y: params.variable_y,
    x_values: xValues.map((v) => parseFloat(((v - 1) * 100).toFixed(1))),
    y_values: yValues.map((v) => parseFloat(((v - 1) * 100).toFixed(1))),
    irr_matrix: irrMatrix,
    roi_matrix: roiMatrix,
  };
}

function applyMultiplier(params: any, variable: string, multiplier: number) {
  switch (variable) {
    case 'sale_price':
      params.salePrice *= multiplier;
      break;
    case 'construction_cost':
      params.totalInvestment *= multiplier;
      break;
    case 'monthly_revenue':
      params.monthlyRevenue *= multiplier;
      break;
  }
}
