import Decimal from 'decimal.js';
import { toDecimal, addDecimal } from './decimal.util';

export type SalePaymentMethod = 'CASH' | 'CARD' | 'MIXED' | 'TRANSFER' | string;

/** subtotal - discount + tax */
export function calculateSaleTotal(subtotal: any, discount: any, tax: any): Decimal {
  return toDecimal(subtotal).minus(toDecimal(discount)).plus(toDecimal(tax));
}

export interface PaymentSplitResult {
  cashAmount: Decimal;
  cardAmount: Decimal;
  /** false only for MIXED when cash + card doesn't add up to total */
  isValid: boolean;
}

/**
 * Resolves how much of `total` was paid in cash vs card.
 * CASH/CARD: the full total goes to that method (any submitted cash/card amounts are ignored).
 * MIXED: caller-submitted cashAmount + cardAmount must equal total exactly.
 */
export function resolvePaymentSplit(
  paymentMethod: SalePaymentMethod,
  total: any,
  cashAmount: any,
  cardAmount: any,
): PaymentSplitResult {
  const totalDecimal = toDecimal(total);
  let cash = toDecimal(cashAmount || 0);
  let card = toDecimal(cardAmount || 0);

  if (paymentMethod === 'MIXED') {
    const isValid = addDecimal(cash, card).equals(totalDecimal);
    return { cashAmount: cash, cardAmount: card, isValid };
  }
  if (paymentMethod === 'CASH') {
    cash = totalDecimal;
    card = new Decimal(0);
  } else if (paymentMethod === 'CARD') {
    card = totalDecimal;
    cash = new Decimal(0);
  }
  return { cashAmount: cash, cardAmount: card, isValid: true };
}
