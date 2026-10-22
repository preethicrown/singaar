'use client';
import { useState } from 'react';
import type { Match } from '@/lib/match';

const EXAMPLES = [
  'South Indian bridal look in Bangalore, saree draping, under 25000, on 14 Dec',
  'Soft glam reception makeup in Chennai under 15000',
  'Traditional bridal artist in Bangalore with mehendi',
];
const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

interface Result { matches: Match[]; look: string; date: string | null }
interface Draft { text: string; blocked: boolean; note?: string }

export default function Home() {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [drafting, setDrafting] = useState<number | null>(null);

  async function search(e?: React.FormEvent, override?: string) {
    e?.preventDefault();
    const q = (override ?? text).trim();
    setResult(null);
    setDrafts({});
    if (q.length < 3) {
      // No network call for an empty box.
      setMessage('Tell us a little about the look you want, for example one of these:');
      setShowExamples(true);
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/understand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: q, date: date || undefined }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult({ matches: data.matches, look: data.query.look, date: data.query.date });
        setShowExamples(false);
      } else {
        setMessage(data.message ?? 'Something went wrong. Please try again.');
        setShowExamples(Array.isArray(data.examples) && res.status < 500);
      }
    } catch {
      setMessage('We could not connect. Check your internet and try again.');
      setShowExamples(false);
    } finally {
      setLoading(false);
    }
  }

  async function request(m: Match) {
    if (!result) return;
    setDrafting(m.provider.id);
    try {
      const res = await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: m.provider.id, look: result.look, date: result.date ?? undefined }),
      });
      const data = await res.json();
      setDrafts((d) => ({
        ...d,
        [m.provider.id]: data.ok
          ? { text: data.draft, blocked: !!data.blocked, note: data.note }
          : { text: data.message ?? 'Could not draft a reply. Please try again.', blocked: true },
      }));
    } catch {
      setDrafts((d) => ({ ...d, [m.provider.id]: { text: 'We could not connect. Please try again.', blocked: true } }));
    } finally {
      setDrafting(null);
    }
  }

  return (
    <>
      <header className="hero">
        <img src="/logo.webp" alt="SINGAAR logo" />
        <h1>SINGAAR</h1>
        <p>Describe the look you want. See independent women artists and salons, their prices, and who is free on your date.</p>
      </header>
      <main>
        <form className="card" onSubmit={search}>
          <label htmlFor="look">Describe your look</label>
          <textarea id="look" value={text} onChange={(e) => setText(e.target.value)} maxLength={500}
            placeholder="e.g. South Indian bridal look in Bangalore, saree draping, under 25000" />
          <div className="row">
            <div>
              <label htmlFor="date">Event date (optional)</label>
              <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <button type="submit" disabled={loading}>{loading ? 'Finding artists…' : 'Find artists'}</button>
          </div>
          <div className="chips">
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" className="chip" disabled={loading}
                onClick={() => { setText(ex); search(undefined, ex); }}>{ex}</button>
            ))}
          </div>
        </form>

        {message && (
          <div className="card msg err" role="status">
            <p style={{ margin: 0 }}>{message}</p>
            {showExamples && (
              <div className="chips">
                {EXAMPLES.map((ex) => (
                  <button key={ex} type="button" className="chip" onClick={() => { setText(ex); search(undefined, ex); }}>{ex}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {result && (
          <>
            <p className="meta">{result.matches.length} artist{result.matches.length > 1 ? 's' : ''} for your {result.look} look. All prices are sample until the artist confirms them.</p>
            {result.matches.map((m) => {
              const d = drafts[m.provider.id];
              return (
                <section className="card" key={m.provider.id}>
                  <div className="top">
                    <div>
                      <h2 className="name">{m.provider.name}</h2>
                      <div className="meta">{m.provider.type === 'artist' ? 'Independent artist' : m.provider.type === 'salon' ? 'Salon' : 'Studio'} · {m.provider.area}, {m.provider.city}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="price">{inr(m.price)}</span>
                      <span className={'badge' + (m.provider.verified ? ' verified' : '')}>{m.provider.verified ? 'verified' : 'sample'}</span>
                      <div>
                        {m.free === null ? <span className="tag none">pick a date to check</span>
                          : m.free ? <span className="tag free">Free on your date</span>
                          : <span className="tag booked">Booked on your date</span>}
                      </div>
                    </div>
                  </div>
                  <p className="why">{m.why}</p>
                  {m.extraPrices.length > 0 && (
                    <p className="meta">{m.extraPrices.map((e) => `${e.look} ${inr(e.price)}`).join(' · ')}</p>
                  )}
                  <div style={{ marginTop: 10 }}>
                    <button className="ghost" type="button" disabled={drafting === m.provider.id} onClick={() => request(m)}>
                      {drafting === m.provider.id ? 'Drafting…' : 'Request'}
                    </button>
                  </div>
                  {d && (
                    <>
                      <div className="draft">{d.text}</div>
                      {d.note && <div className="note">{d.note}</div>}
                      <div className="meta" style={{ marginTop: 6 }}>Draft only. Nothing is sent. The artist confirms the date and price herself.</div>
                    </>
                  )}
                </section>
              );
            })}
          </>
        )}
      </main>
      <footer className="foot">Prototype with sample artists and sample prices. Built for the Mesa ForgeX hackathon.</footer>
    </>
  );
}
