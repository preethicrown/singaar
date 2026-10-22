// Plain code, no AI: every rupee amount in a drafted reply must be on the provider's own price list.
// AI writes wording only; this script is what stops it from inventing a price.
export function extractAmounts(text: string): number[] {
  const found: number[] = [];
  const add = (s: string, mult = 1) => {
    const n = Number(s.replace(/,/g, '')) * mult;
    if (Number.isFinite(n)) found.push(n);
  };
  let m: RegExpExecArray | null;
  // ₹18,000   Rs. 18000   INR 18000   ₹18k
  const cur = /(?:₹|rs\.?|inr)\s*(\d[\d,]*(?:\.\d+)?)(\s*k\b)?/gi;
  while ((m = cur.exec(text))) add(m[1], m[2] ? 1000 : 1);
  // 18000 rupees
  const word = /(\d[\d,]*(?:\.\d+)?)\s*(?:rupees|rs\b|inr\b)/gi;
  while ((m = word.exec(text))) add(m[1]);
  // 18k
  const k = /\b(\d+(?:\.\d+)?)\s*k\b/gi;
  while ((m = k.exec(text))) add(m[1], 1000);
  // bare 18,000 with a thousands comma
  const comma = /\b\d{1,3}(?:,\d{2,3})+\b/g;
  while ((m = comma.exec(text))) add(m[0]);
  return found;
}

export function checkPrices(draft: string, allowed: number[]): { ok: boolean; bad: number[] } {
  const set = new Set(allowed);
  const bad = Array.from(new Set(extractAmounts(draft))).filter((n) => !set.has(n));
  return { ok: bad.length === 0, bad };
}
