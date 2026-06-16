import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  parseMonth,
  formatDate,
} from './date.util';

describe('date.util', () => {
  it('parseMonth splits "YYYY-MM" into numbers', () => {
    expect(parseMonth('2026-06')).toEqual({ year: 2026, month: 6 });
  });

  it('startOfMonth/endOfMonth bracket the whole month', () => {
    const start = startOfMonth(2026, 6);
    const end = endOfMonth(2026, 6);
    expect(formatDate(start)).toBe('2026-06-01');
    expect(formatDate(end)).toBe('2026-06-30');
    expect(start.getTime()).toBeLessThan(end.getTime());
  });

  it('handles February in a leap year correctly', () => {
    const end = endOfMonth(2028, 2);
    expect(formatDate(end)).toBe('2028-02-29');
  });

  it('startOfDay/endOfDay bracket a single day', () => {
    const start = startOfDay('2026-06-15');
    const end = endOfDay('2026-06-15');
    expect(formatDate(start)).toBe('2026-06-15');
    expect(formatDate(end)).toBe('2026-06-15');
    expect(start.getHours()).toBe(0);
    expect(end.getHours()).toBe(23);
  });
});
