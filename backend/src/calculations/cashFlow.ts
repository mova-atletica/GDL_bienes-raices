export interface CashFlowParams {
  totalInvestment: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  projectionMonths: number;
  salePrice: number;
  saleMonth: number | null;
}

/**
 * Generate monthly cash flow array.
 * Month 0: negative total investment
 * Months 1-N: net monthly income (revenue - expenses)
 * Sale month: includes sale proceeds
 */
export function generateCashFlows(params: CashFlowParams): number[] {
  const { totalInvestment, monthlyRevenue, monthlyExpenses, projectionMonths, salePrice, saleMonth } = params;
  const cashFlows: number[] = [];

  // Month 0: investment outflow
  cashFlows.push(-totalInvestment);

  const exitMonth = saleMonth || projectionMonths;

  for (let month = 1; month <= projectionMonths; month++) {
    let cf = monthlyRevenue - monthlyExpenses;

    // Add sale proceeds at exit month
    if (month === exitMonth) {
      cf += salePrice;
    }

    cashFlows.push(cf);
  }

  return cashFlows;
}

/**
 * Calculate cumulative cash flows from a cash flow array
 */
export function cumulativeCashFlows(cashFlows: number[]): number[] {
  const cumulative: number[] = [];
  let running = 0;
  for (const cf of cashFlows) {
    running += cf;
    cumulative.push(running);
  }
  return cumulative;
}
