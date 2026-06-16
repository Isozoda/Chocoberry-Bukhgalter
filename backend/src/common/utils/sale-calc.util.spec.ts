import { calculateSaleTotal, resolvePaymentSplit } from './sale-calc.util';

describe('sale-calc.util / calculateSaleTotal', () => {
  it('is subtotal - discount + tax', () => {
    expect(calculateSaleTotal(100, 10, 5).toNumber()).toBe(95);
  });

  it('defaults discount/tax of undefined to 0', () => {
    expect(calculateSaleTotal(100, undefined, undefined).toNumber()).toBe(100);
  });
});

describe('sale-calc.util / resolvePaymentSplit', () => {
  it('CASH: full total goes to cash, card is 0, regardless of submitted amounts', () => {
    const r = resolvePaymentSplit('CASH', 100, 999, 999);
    expect(r.isValid).toBe(true);
    expect(r.cashAmount.toNumber()).toBe(100);
    expect(r.cardAmount.toNumber()).toBe(0);
  });

  it('CARD: full total goes to card, cash is 0', () => {
    const r = resolvePaymentSplit('CARD', 100, 999, 999);
    expect(r.isValid).toBe(true);
    expect(r.cardAmount.toNumber()).toBe(100);
    expect(r.cashAmount.toNumber()).toBe(0);
  });

  it('MIXED: valid when cash + card equals total', () => {
    const r = resolvePaymentSplit('MIXED', 100, 60, 40);
    expect(r.isValid).toBe(true);
    expect(r.cashAmount.toNumber()).toBe(60);
    expect(r.cardAmount.toNumber()).toBe(40);
  });

  it('MIXED: invalid when cash + card does not equal total', () => {
    const r = resolvePaymentSplit('MIXED', 100, 60, 30);
    expect(r.isValid).toBe(false);
  });

  it('MIXED: missing cash/card amounts default to 0 and are invalid unless total is 0', () => {
    const r = resolvePaymentSplit('MIXED', 100, undefined, undefined);
    expect(r.isValid).toBe(false);
  });

  it('TRANSFER (or any other method): passes submitted cash/card through unchanged', () => {
    const r = resolvePaymentSplit('TRANSFER', 100, 30, 70);
    expect(r.isValid).toBe(true);
    expect(r.cashAmount.toNumber()).toBe(30);
    expect(r.cardAmount.toNumber()).toBe(70);
  });
});
