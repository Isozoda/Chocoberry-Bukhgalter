import { calcMarginPercent } from './pnl.util';

describe('pnl.util / calcMarginPercent', () => {
  it('computes a percentage of numerator over denominator', () => {
    expect(calcMarginPercent(25, 100)).toBe('25.00');
    expect(calcMarginPercent(1, 3)).toBe('33.33');
  });

  it('returns 0.00 instead of dividing by zero', () => {
    expect(calcMarginPercent(100, 0)).toBe('0.00');
    expect(calcMarginPercent(0, 0)).toBe('0.00');
  });

  it('supports negative margins (loss)', () => {
    expect(calcMarginPercent(-50, 100)).toBe('-50.00');
  });
});
