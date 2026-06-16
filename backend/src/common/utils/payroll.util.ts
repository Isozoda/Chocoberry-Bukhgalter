import Decimal from 'decimal.js';
import { toDecimal } from './decimal.util';

export interface PayrollInput {
  baseSalary: any;
  bonusPercent: any;
  totalSales: any;
  fines: any;
  advances: any;
}

export interface PayrollResult {
  baseSalary: Decimal;
  bonus: Decimal;
  fines: Decimal;
  advances: Decimal;
  finalSalary: Decimal;
}

/**
 * Pure payroll calculation: base salary + (totalSales * bonusPercent / 100) - fines - advances.
 * Used by both single-employee and bulk monthly payroll calculations — keep them in sync.
 */
export function calculatePayroll(input: PayrollInput): PayrollResult {
  const baseSalary = toDecimal(input.baseSalary);
  const totalSales = toDecimal(input.totalSales);
  const bonusPercent = toDecimal(input.bonusPercent);
  const fines = toDecimal(input.fines);
  const advances = toDecimal(input.advances);

  const bonus = totalSales.times(bonusPercent).dividedBy(100);
  const finalSalary = baseSalary.plus(bonus).minus(fines).minus(advances);

  return { baseSalary, bonus, fines, advances, finalSalary };
}
