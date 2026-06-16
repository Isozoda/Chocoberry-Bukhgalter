import {
  toDecimal,
  addDecimal,
  subtractDecimal,
  multiplyDecimal,
  divideDecimal,
  maxDecimal,
  formatMoney,
  calcWeightedAvgCost,
} from './decimal.util';

describe('decimal.util', () => {
  describe('toDecimal', () => {
    it('treats null/undefined as 0', () => {
      expect(toDecimal(null).toNumber()).toBe(0);
      expect(toDecimal(undefined).toNumber()).toBe(0);
    });

    it('parses numbers and numeric strings', () => {
      expect(toDecimal(12.5).toNumber()).toBe(12.5);
      expect(toDecimal('12.50').toNumber()).toBe(12.5);
    });
  });

  describe('addDecimal / subtractDecimal', () => {
    it('adds an arbitrary list of values without floating point drift', () => {
      // 0.1 + 0.2 famously isn't 0.3 in plain JS floats
      expect(addDecimal(0.1, 0.2).toNumber()).toBe(0.3);
      expect(addDecimal(1, 2, 3, 4).toNumber()).toBe(10);
    });

    it('subtracts b from a', () => {
      expect(subtractDecimal(10, 4).toNumber()).toBe(6);
    });
  });

  describe('multiplyDecimal / divideDecimal', () => {
    it('multiplies precisely', () => {
      expect(multiplyDecimal(2.5, 4).toNumber()).toBe(10);
    });

    it('returns 0 instead of throwing on division by zero', () => {
      expect(divideDecimal(10, 0).toNumber()).toBe(0);
    });

    it('divides normally otherwise', () => {
      expect(divideDecimal(10, 4).toNumber()).toBe(2.5);
    });
  });

  describe('maxDecimal', () => {
    it('returns the larger of two values', () => {
      expect(maxDecimal(3, 7).toNumber()).toBe(7);
      expect(maxDecimal(7, 3).toNumber()).toBe(7);
    });
  });

  describe('formatMoney', () => {
    it('always formats with 2 decimal places', () => {
      expect(formatMoney(5)).toBe('5.00');
      expect(formatMoney(5.005)).toBe('5.01'); // ROUND_HALF_UP
    });
  });

  describe('calcWeightedAvgCost', () => {
    it('computes weighted average cost of stock after a purchase', () => {
      // 10 units @ 2 + 10 units @ 4 => avg cost 3
      expect(calcWeightedAvgCost(10, 2, 10, 4).toNumber()).toBe(3);
    });

    it('returns 0 when there is no stock at all', () => {
      expect(calcWeightedAvgCost(0, 0, 0, 0).toNumber()).toBe(0);
    });

    it('falls back to the new unit cost when starting from zero stock', () => {
      expect(calcWeightedAvgCost(0, 0, 5, 6).toNumber()).toBe(6);
    });
  });
});
