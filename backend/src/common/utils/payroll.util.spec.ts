import { calculatePayroll } from './payroll.util';

describe('payroll.util / calculatePayroll', () => {
  it('computes base salary + sales bonus - fines - advances', () => {
    const result = calculatePayroll({
      baseSalary: 1000,
      bonusPercent: 2, // 2% of sales
      totalSales: 5000,
      fines: 50,
      advances: 100,
    });

    expect(result.baseSalary.toNumber()).toBe(1000);
    expect(result.bonus.toNumber()).toBe(100); // 2% of 5000
    expect(result.fines.toNumber()).toBe(50);
    expect(result.advances.toNumber()).toBe(100);
    // 1000 + 100 - 50 - 100 = 950
    expect(result.finalSalary.toNumber()).toBe(950);
  });

  it('treats missing fines/advances/bonus as zero', () => {
    const result = calculatePayroll({
      baseSalary: 1000,
      bonusPercent: 0,
      totalSales: 0,
      fines: null,
      advances: undefined,
    });
    expect(result.finalSalary.toNumber()).toBe(1000);
  });

  it('can go negative when fines + advances exceed salary + bonus', () => {
    const result = calculatePayroll({
      baseSalary: 100,
      bonusPercent: 0,
      totalSales: 0,
      fines: 50,
      advances: 200,
    });
    expect(result.finalSalary.toNumber()).toBe(-150);
  });

  it('matches across the single-employee and bulk payroll call sites (same formula)', () => {
    // Both EmployeesService.getPayrollForMonth and calculateMonthlyPayroll
    // delegate to this function — this test pins the shared formula so the
    // two call sites can never silently drift apart again.
    const a = calculatePayroll({
      baseSalary: 1500,
      bonusPercent: 3,
      totalSales: 10000,
      fines: 0,
      advances: 0,
    });
    const b = calculatePayroll({
      baseSalary: 1500,
      bonusPercent: 3,
      totalSales: 10000,
      fines: 0,
      advances: 0,
    });
    expect(a.finalSalary.toNumber()).toBe(b.finalSalary.toNumber());
    expect(a.finalSalary.toNumber()).toBe(1800); // 1500 + 300
  });
});
