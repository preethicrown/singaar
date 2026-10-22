# SINGAAR web app (hackathon MVP)

One screen: a bride describes her look, sees artists with sample prices and date availability, and drafts a request.

## Run it
1. `cd web`
2. `npm install`
3. Copy `.env.example` to `.env.local` and paste your Anthropic API key after `ANTHROPIC_API_KEY=`. Never commit `.env.local` (it is git-ignored).
4. `npm run dev` and open http://localhost:3100 (or 3000 if you run `npx next dev` yourself).
5. `npm test` runs the checks for the matching and price-check logic.

## Where AI is used (and where it is not)
- AI call 1, `/api/understand`: turns her sentence into city, look, budget, style words, date.
- AI call 2, `/api/draft`: writes the wording of the artist's reply.
- Plain code: filtering, budget, date check, ranking, sample/verified badges, and the price check that blocks any draft containing a rupee amount not on the artist's own list (`lib/match.ts`, `lib/priceCheck.ts`).

## Deliberate narrowing of the scope
Providers are a sample list in `lib/providers.ts` (no Supabase, n8n, accounts, provider inbox or compare table here). All prices are labelled sample. The static prototype in the repo root still shows the wider journey.

## Deploy to Vercel
Import the GitHub repo, set **Root Directory** to `web`, add `ANTHROPIC_API_KEY` under Environment Variables, deploy.
