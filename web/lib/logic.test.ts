import { describe, expect, it } from 'vitest';
import { findMatches } from './match';
import { checkPrices } from './priceCheck';
import { getProvider } from './providers';

describe('findMatches (test 1)', () => {
  const q = { city: 'Bangalore' as const, look: 'bridal' as const, budget: 25000, styleWords: ['traditional'], extras: ['saree' as const], date: '2026-12-13' };
  const res = findMatches(q);

  it('returns at least 3 Bangalore providers within budget', () => {
    expect(res.length).toBeGreaterThanOrEqual(3);
    for (const m of res) {
      expect(m.provider.city).toBe('Bangalore');
      expect(m.price).toBeLessThanOrEqual(25000);
    }
  });
  it('drops providers above the budget (Kavya is 28000)', () => {
    expect(res.find((m) => m.provider.name === 'Kavya N')).toBeUndefined();
  });
  it('marks a booked date as not free and ranks it last', () => {
    const lakshmi = res.find((m) => m.provider.name === 'Lakshmi Beauty Care');
    expect(lakshmi?.free).toBe(false);
    expect(res[res.length - 1].free).toBe(false);
  });
  it('gives every card a why line and sample label data', () => {
    for (const m of res) { expect(m.why.length).toBeGreaterThan(5); expect(m.provider.verified).toBe(false); }
  });
  it('returns nothing for an impossible budget', () => {
    expect(findMatches({ ...q, budget: 500 })).toHaveLength(0);
  });
});

describe('checkPrices (test 2)', () => {
  const allowed = Object.values(getProvider(9)!.prices) as number[];
  it('accepts amounts from her list in several formats', () => {
    expect(checkPrices('My bridal look is ₹16,000 and saree draping Rs. 1200.', allowed).ok).toBe(true);
    expect(checkPrices('Bridal is 16000 rupees.', allowed).ok).toBe(true);
  });
  it('blocks an amount that is not on her list', () => {
    const r = checkPrices('I can do it for ₹500 only!', allowed);
    expect(r.ok).toBe(false);
    expect(r.bad).toContain(500);
  });
  it('blocks totals and k-shorthand that are not on the list', () => {
    expect(checkPrices('Total ₹17,200 for both.', allowed).ok).toBe(false);
    expect(checkPrices('About 15k.', allowed).ok).toBe(false);
  });
  it('ignores dates and years', () => {
    expect(checkPrices('See you on 14 December 2026 at 9 am.', allowed).ok).toBe(true);
  });
});
