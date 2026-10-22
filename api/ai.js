// SINGAAR AI helper (Vercel serverless function). Calls Claude through OpenRouter.
// The key lives only in Vercel's environment (OPENROUTER_API_KEY), never in the website or the repo.
// Three jobs:
//   look  - turn a customer's sentence into search filters
//   chat  - reply as a SAMPLE artist in the demo chat (never for real artists)
//   draft - suggest a reply a real artist can edit before sending
// AI writes wording only. Plain code below blocks any reply that mentions a price not on the artist's list.

const MODEL = process.env.AI_MODEL || 'anthropic/claude-haiku-4.5';
const ALLOWED_HOSTS = ['singaar.vercel.app', 'localhost', '127.0.0.1'];

function extractAmounts(text) {
  const found = [];
  const add = (s, mult = 1) => { const n = Number(String(s).replace(/,/g, '')) * mult; if (Number.isFinite(n)) found.push(n); };
  let m;
  const cur = /(?:₹|rs\.?|inr)\s*(\d[\d,]*(?:\.\d+)?)(\s*k\b)?/gi;
  while ((m = cur.exec(text))) add(m[1], m[2] ? 1000 : 1);
  const word = /(\d[\d,]*(?:\.\d+)?)\s*(?:rupees|rs\b|inr\b)/gi;
  while ((m = word.exec(text))) add(m[1]);
  const k = /\b(\d+(?:\.\d+)?)\s*k\b/gi;
  while ((m = k.exec(text))) add(m[1], 1000);
  const comma = /\b\d{1,3}(?:,\d{2,3})+\b/g;
  while ((m = comma.exec(text))) add(m[0]);
  return found;
}
function pricesOk(text, allowed) {
  const set = new Set(allowed);
  return extractAmounts(text).every((n) => set.has(n));
}
const clip = (s, n) => String(s == null ? '' : s).slice(0, n);

async function complete(system, user, maxTokens) {
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://singaar.vercel.app',
      'X-Title': 'SINGAAR',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, temperature: 0.4, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  });
  if (!r.ok) throw new Error('AI request failed: ' + r.status);
  const data = await r.json();
  return String((data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
}

function chatContext(body) {
  const a = body.artist || {};
  const prices = (Array.isArray(a.prices) ? a.prices : []).slice(0, 20).map((p) => ({ label: clip(p.label, 40), amount: Math.round(Number(p.amount)) || 0 }));
  const bk = body.booking || {};
  const history = (Array.isArray(body.history) ? body.history : []).slice(-10)
    .map((h) => `${h.from === 'artist' ? 'Artist' : 'Customer'}: ${clip(h.text, 500)}`).join('\n');
  const priceList = prices.map((p) => `- ${p.label}: ₹${p.amount.toLocaleString('en-IN')}`).join('\n') || '- (no prices listed)';
  const facts = `Booking: ${clip(bk.service, 40)} on ${clip(bk.date, 20)} at ${clip(bk.venue, 80)}. Status: ${clip(bk.status, 20)}.`;
  return { name: clip(a.name, 60), prices, priceList, facts, history };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const origin = req.headers.origin || req.headers.referer || '';
  let host = '';
  try { host = new URL(origin).hostname; } catch (e) {}
  if (!ALLOWED_HOSTS.includes(host)) return res.status(403).json({ ok: false, message: 'Not allowed' });
  if (!process.env.OPENROUTER_API_KEY) return res.status(503).json({ ok: false, message: 'AI is not set up yet' });

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  try {
    if (body.task === 'look') {
      const text = clip(body.text, 300).trim();
      const looks = (Array.isArray(body.looks) ? body.looks : []).slice(0, 40).map((x) => clip(x, 30));
      const styles = (Array.isArray(body.styles) ? body.styles : []).slice(0, 20).map((x) => clip(x, 30));
      if (text.length < 3) return res.json({ ok: false });
      const raw = await complete(
        `You turn an Indian customer's beauty request into search filters for SINGAAR, a marketplace for makeup artists and salons in Bangalore and Chennai.
Reply with JSON only, no code fences: {"occ": one of ${JSON.stringify(looks)} or null, "city": "Bangalore" or "Chennai" or null, "budget": rupees as a number or 0, "styles": array of items from ${JSON.stringify(styles)}}.
Understand English, Hinglish, Tamil and Kannada words. "20k" means 20000. Muhurtham, wedding morning or kalyanam means bridal.`,
        text, 150);
      const j = JSON.parse(raw.replace(/^```(?:json)?|```$/g, '').trim());
      return res.json({
        ok: true,
        occ: looks.includes(j.occ) ? j.occ : null,
        city: ['Bangalore', 'Chennai'].includes(j.city) ? j.city : null,
        budget: Math.max(0, Math.min(200000, Math.round(Number(j.budget) || 0))),
        styles: (Array.isArray(j.styles) ? j.styles : []).filter((s) => styles.includes(s)),
      });
    }

    if (body.task === 'chat' || body.task === 'draft') {
      const c = chatContext(body);
      const allowed = c.prices.map((p) => p.amount);
      const isDraft = body.task === 'draft';
      const system = `You are writing ${isDraft ? 'a suggested reply for' : 'as'} ${c.name}, ${isDraft ? 'a makeup artist or salon on SINGAAR, replying to a customer in the booking chat' : 'a SAMPLE makeup artist in the SINGAAR demo, replying to a customer in the booking chat'}.
Write 1 or 2 short, warm sentences in the customer's language (simple English or Hinglish is fine). No emojis.
Only mention prices from this list, written exactly as shown, and never total, discount or invent an amount:
${c.priceList}
${c.facts}
Never share phone numbers, addresses or links. Never promise anything outside the booking. If asked something you cannot know, say you will confirm on the day.`;
      const user = `${c.history ? 'Chat so far:\n' + c.history + '\n\n' : ''}${isDraft ? 'Write the artist\'s next reply.' : 'Customer: ' + clip(body.message, 500) + '\nReply as the artist.'}`;
      let reply = await complete(system, user, 160);
      reply = reply.replace(/^["']|["']$/g, '').trim().slice(0, 400);
      if (!reply || !pricesOk(reply, allowed)) {
        reply = 'Thank you! The prices are exactly as listed on my profile. I will confirm the details with you before the day.';
        return res.json({ ok: true, reply, checked: true });
      }
      return res.json({ ok: true, reply });
    }

    return res.status(400).json({ ok: false });
  } catch (e) {
    return res.status(502).json({ ok: false, message: 'AI is busy, please try again' });
  }
};
