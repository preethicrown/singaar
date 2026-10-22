// Plain code, no AI: filter, budget, date check and ranking.
import { City, Look, Provider, PROVIDERS } from './providers';

export interface Query {
  city: City | null;
  look: Look;
  budget: number | null; // maximum rupees for the main look
  styleWords: string[];
  extras: Look[]; // other services she mentioned, e.g. saree draping
  date: string | null; // YYYY-MM-DD
}

export interface Match {
  provider: Provider;
  price: number;
  extraPrices: { look: Look; price: number }[];
  free: boolean | null; // null = no date given
  why: string;
}

const norm = (s: string) => s.toLowerCase();

export function formatInr(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export function formatDate(iso: string) {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function isFree(p: Provider, date: string | null): boolean | null {
  if (!date) return null;
  return !p.booked.includes(date);
}

export function findMatches(q: Query, providers: Provider[] = PROVIDERS): Match[] {
  const out: (Match & { score: number })[] = [];
  for (const p of providers) {
    if (q.city && p.city !== q.city) continue;
    const price = p.prices[q.look];
    if (price === undefined) continue;
    if (q.budget !== null && price > q.budget) continue;

    const wanted = q.styleWords.map(norm).filter(Boolean);
    const hits = p.styles.filter((s) => wanted.some((w) => norm(s).includes(w) || w.includes(norm(s))));
    const extraPrices = q.extras
      .filter((e) => e !== q.look && p.prices[e] !== undefined)
      .map((e) => ({ look: e, price: p.prices[e] as number }));
    const free = isFree(p, q.date);

    const reasons = [`${q.look} look from ${formatInr(price)}`];
    if (q.budget !== null) reasons.push(`within your ${formatInr(q.budget)} budget`);
    if (hits.length) reasons.push(`style: ${hits.join(', ')}`);
    if (extraPrices.length) reasons.push(`also does ${extraPrices.map((e) => e.look).join(', ')}`);
    if (free !== null && q.date) reasons.push(free ? `free on ${formatDate(q.date)}` : `booked on ${formatDate(q.date)}`);

    out.push({
      provider: p, price, extraPrices, free,
      why: reasons.join(' · '),
      score: hits.length * 10 + extraPrices.length * 3 + (free === false ? -100 : 0),
    });
  }
  out.sort((a, b) => b.score - a.score || a.price - b.price);
  return out.slice(0, 6).map(({ score: _score, ...m }) => m);
}
