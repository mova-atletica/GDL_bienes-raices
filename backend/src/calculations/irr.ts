/**
 * Calculate IRR using Newton-Raphson iteration.
 * Cash flows: array where index 0 is the initial investment (negative),
 * subsequent values are periodic (monthly) net cash flows.
 * Returns monthly IRR. Annualize with: (1 + monthlyIRR)^12 - 1
 */
export function calculateIRR(cashFlows: number[], guess: number = 0.01, maxIterations: number = 100, tolerance: number = 1e-7): number | null {
  if (cashFlows.length < 2) return null;

  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0; // derivative of NPV

    for (let t = 0; t < cashFlows.length; t++) {
      const factor = Math.pow(1 + rate, t);
      npv += cashFlows[t] / factor;
      if (t > 0) {
        dnpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
      }
    }

    if (Math.abs(dnpv) < 1e-12) return null; // avoid division by zero

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;
  }

  return null; // did not converge
}

/**
 * Convert monthly IRR to annual IRR
 */
export function annualizeIRR(monthlyIRR: number): number {
  return Math.pow(1 + monthlyIRR, 12) - 1;
}
