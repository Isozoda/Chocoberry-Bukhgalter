import { toDecimal } from './decimal.util';

/**
 * Percentage of `numerator` over `denominator`, formatted to 2 decimals.
 * Returns '0.00' when denominator is zero, instead of dividing by zero.
 * Used for profit margin, gross margin, supplier share, etc.
 */
export function calcMarginPercent(numerator: any, denominator: any): string {
  const denom = toDecimal(denominator);
  if (denom.isZero()) return '0.00';
  return toDecimal(numerator).dividedBy(denom).times(100).toFixed(2);
}
