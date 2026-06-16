import { BadRequestException } from '@nestjs/common';
import { toDecimal } from './decimal.util';

// Guard for any outgoing cash operation (payroll, expenses, supplier
// payments, manual cash-out/close). Call this BEFORE debiting
// cashbox.balance — throws instead of letting the cash balance go negative.
export function assertSufficientCashBalance(currentBalance: any, amount: any): void {
  const balance = toDecimal(currentBalance);
  const requested = toDecimal(amount);
  if (requested.greaterThan(balance)) {
    // Stable error code (not a human sentence) — the frontend looks this up
    // to render a localized message with the actual numbers.
    throw new BadRequestException({
      message: 'INSUFFICIENT_CASH_BALANCE',
      details: { available: balance.toFixed(2), requested: requested.toFixed(2) },
    });
  }
}

// Same guard, but for a card balance (DC or Alif) — used when an outgoing
// payment is made by card instead of cash.
export function assertSufficientCardBalance(
  currentBalance: any,
  amount: any,
  cardType: 'DUSHANBE_CITY' | 'ALIF',
): void {
  const balance = toDecimal(currentBalance);
  const requested = toDecimal(amount);
  if (requested.greaterThan(balance)) {
    throw new BadRequestException({
      message: 'INSUFFICIENT_CARD_BALANCE',
      details: { available: balance.toFixed(2), requested: requested.toFixed(2), cardType },
    });
  }
}
