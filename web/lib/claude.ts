// The only place the AI is called. Uses OpenRouter (OpenAI-compatible); the key is read from the server's environment.
export const MODEL = process.env.AI_MODEL || 'anthropic/claude-haiku-4.5';

export function aiConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

export async function complete(opts: { system: string; user: string; maxTokens?: number }): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 300,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  const data = await res.json();
  return String(data?.choices?.[0]?.message?.content ?? '').trim();
}
