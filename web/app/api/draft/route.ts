// AI call #2: draft reply wording. A script then checks every rupee amount against the provider's own list.
import { NextResponse } from 'next/server';
import { getClient, MODEL, textOf } from '@/lib/claude';
import { formatDate, formatInr } from '@/lib/match';
import { checkPrices } from '@/lib/priceCheck';
import { getProvider, LOOKS, Look } from '@/lib/providers';

function safeReply(name: string, look: Look, price: number, date: string | null) {
  const when = date ? ` for ${formatDate(date)}` : '';
  return `Hello! Thank you for your request. My ${look} look is ${formatInr(price)} (sample price).` +
    ` I would love to do it${when}, subject to my confirmation. Shall we confirm the details? - ${name}`;
}

export async function POST(req: Request) {
  let body: { providerId?: unknown; look?: unknown; date?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Bad request.' }, { status: 400 });
  }
  const provider = typeof body.providerId === 'number' ? getProvider(body.providerId) : undefined;
  const look = (LOOKS as unknown[]).includes(body.look) ? (body.look as Look) : null;
  const date = typeof body.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : null;
  if (!provider || !look || provider.prices[look] === undefined) {
    return NextResponse.json({ ok: false, message: 'That artist does not offer this look.' }, { status: 400 });
  }

  const price = provider.prices[look] as number;
  const allowed = Object.values(provider.prices) as number[];
  const fallback = safeReply(provider.name, look, price, date);

  const client = getClient();
  if (!client) return NextResponse.json({ ok: false, message: 'The AI helper is not set up yet (missing API key on the server).' }, { status: 503 });

  const priceList = Object.entries(provider.prices).map(([k, v]) => `- ${k}: ${formatInr(v as number)}`).join('\n');
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: `You write a short, warm reply (3 to 4 sentences) from a makeup artist or salon named ${provider.name} to a bride's booking request.
Rules: use ONLY prices from this list, written exactly as shown, and never add, total, discount or invent any amount.
${priceList}
Say the requested date${date ? ` (${formatDate(date)})` : ''} is subject to your confirmation; do not promise it. No emojis. Plain text only.`,
      messages: [{ role: 'user', content: `A bride requests a ${look} look${date ? ' on ' + formatDate(date) : ''}. Write the reply.` }],
    });
    const draft = textOf(res);
    const check = checkPrices(draft, allowed);
    if (!draft || !check.ok) {
      return NextResponse.json({ ok: true, blocked: true, draft: fallback, note: 'The AI draft quoted a number that is not on her price list, so we used a safe message instead.' });
    }
    return NextResponse.json({ ok: true, blocked: false, draft });
  } catch {
    return NextResponse.json({ ok: false, message: 'We could not reach the AI helper just now. Please try again.' }, { status: 502 });
  }
}
