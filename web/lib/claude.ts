// The only place the Claude client is created. The key is read from the server's environment.
import Anthropic from '@anthropic-ai/sdk';

export const MODEL = 'claude-haiku-5-5';

export function getClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

export function textOf(res: { content: { type: string; text?: string }[] }): string {
  return res.content.map((b) => (b.type === 'text' ? b.text ?? '' : '')).join('').trim();
}
