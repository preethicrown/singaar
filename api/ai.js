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
    if (body.task === 'brief') {
      // The core AI job: turn a customer's occasion, needs and (optional) outfit photo into a structured Look Brief
      // that decides which services she needs and is sent to verified artists for quotes.
      const services = (Array.isArray(body.services) ? body.services : []).slice(0, 30).map((x) => clip(x, 30));
      const ritual = clip(body.ritual, 40), city = clip(body.city, 20), notes = clip(body.notes, 500);
      const budget = Math.max(0, Math.min(500000, Math.round(Number(body.budget) || 0)));
      const img = typeof body.image === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(body.image) && body.image.length < 3000000 ? body.image : null;
      const system = `You are SINGAAR's bridal and occasion stylist for India. From the customer's details${img ? ' and the photo of her outfit' : ''}, write a practical Look Brief that a makeup artist can work from.
Reply with JSON only, no code fences, exactly this shape:
{"summary":"one warm sentence","outfit":"what you see in the outfit (colour, fabric, work) or an empty string","palette":[{"name":"colour name","hex":"#RRGGBB"}],"looks":[{"ritual":"","makeup":"","hair":"","draping":"","jewellery":""}],"services":[keys from ${JSON.stringify(services)}],"checklist":["short prep steps for the weeks before"],"ask_artist":["questions she should ask the artist"]}
Rules: 3 to 5 palette colours that suit the outfit and Indian skin tones; one entry in "looks" per ritual she mentions (at least one); each field under 18 words; "services" only from the given keys; 4 to 6 checklist items; 2 or 3 questions. Never mention prices, brands to buy, or medical advice. Respect her tradition (Hindu, Muslim, Christian, other) when it is mentioned.`;
      const text = `Occasion: ${ritual}. City: ${city}. Budget: ${budget ? '₹' + budget : 'not given'}. Her words: ${notes || '(none)'}`;
      const user = img ? [{ type: 'text', text }, { type: 'image_url', image_url: { url: img } }] : text;
      const raw = await complete(system, user, 900);
      const j = JSON.parse(raw.replace(/^```(?:json)?|```$/g, '').trim());
      const S = (v, n) => clip(typeof v === 'string' ? v : '', n);
      const brief = {
        summary: S(j.summary, 220),
        outfit: S(j.outfit, 220),
        palette: (Array.isArray(j.palette) ? j.palette : []).slice(0, 6).map((p) => ({ name: S(p && p.name, 30), hex: /^#[0-9A-Fa-f]{6}$/.test(p && p.hex) ? p.hex : '#B3121F' })),
        looks: (Array.isArray(j.looks) ? j.looks : []).slice(0, 6).map((l) => ({ ritual: S(l && l.ritual, 40), makeup: S(l && l.makeup, 160), hair: S(l && l.hair, 160), draping: S(l && l.draping, 160), jewellery: S(l && l.jewellery, 160) })),
        services: (Array.isArray(j.services) ? j.services : []).filter((s) => services.includes(s)).slice(0, 8),
        checklist: (Array.isArray(j.checklist) ? j.checklist : []).slice(0, 8).map((x) => S(x, 140)),
        ask_artist: (Array.isArray(j.ask_artist) ? j.ask_artist : []).slice(0, 4).map((x) => S(x, 140)),
      };
      if (!brief.looks.length) return res.status(502).json({ ok: false, message: 'AI could not build the brief' });
      return res.json({ ok: true, brief, sawPhoto: !!img });
    }

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
