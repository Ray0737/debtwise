# Debtwise

Debt support app for normal Thai users. See all debts by bank and type, get a plan you can afford, check refinancing, estimate tax, and talk to an AI consultant that only discusses your own money. Phone first, adaptive to desktop. Built for U-Hackathon 2026 (Track 1, AI).

Source: https://github.com/Ray0737/debtwise (public). Issues and pull requests are welcome.

## Status

Built and tested: engine, API, every screen, Thai and English. 131 unit tests pass, typecheck and build are clean. The AI consultant was spot-checked against a live Gemini key on 2026-10-16 (on-topic answers, off-topic and prompt-injection refusals, distress reply). Not yet clicked through end to end in a browser against live Supabase. See `docs/HANDOFF.md` for what is and is not verified.

## What it does

- **Debts:** upload a statement (PDF, JPG, PNG, WebP), talk it through, or enter by hand with a Thai bank picker in brand colours. Each number keeps its source line.
- **Plan:** monthly plan from your income, essentials, tax set-aside and minimums. Refinance check and lender message draft.
- **Consultant:** chat with history and new chat. It quotes only figures the app computed, names public Bank of Thailand programmes with sources, declines off-topic requests, and answers a distress message with the 1323 hotline only.
- **Tax:** estimate from the Revenue Department rules for tax year 2568, plus a questionnaire (spouse, children, parents, insurance, home loan interest) that feeds allowances into the estimate and the monthly plan.
- **Invest:** live token prices with 7-day lines (CoinGecko), a sample unlock calendar, and a spare cash card that compares savings interest with your debt interest. Information only.
- **Uploads are checked:** type from the file's own bytes, 10 MB cap, PDFs with scripts or embedded files blocked, server re-check, per-user rate limit, one log line per upload.

## Docs

- `docs/HANDOFF.md` : current state, what is verified, open items
- `docs/debt-wise-finance-summary-3years.md` : 3-year finance plan (the only current finance file)
- `docs/pitch/` : pitch slides and diagrams
- `docs/superpowers/specs/2026-10-15-debtwise-design.md` : what we build and why
- `docs/superpowers/plans/` : implementation plans
- `docs/debt-app-idea-summary.md` : idea and market research
- `docs/screenshots/` : phone screenshots (taken before the 2026-10-16 UI changes)
- `CODEMAP.md` : where things live

## Stack

React, TypeScript, Vite, PWA, Supabase (Auth and Postgres), Vercel (hosting and serverless functions), Gemini API with a Groq text fallback, ElevenLabs, Vitest.

## Rules

- The browser holds only the Supabase URL and anon key. Never put a `service_role` or AI key in client code.
- Money figures come from the engine in `src/engine`, never from the AI. A reply that states a figure not in the app's data is flagged.
- Sample data is always labelled `sample`.
- A few things live only in the browser (chat split points, tax answers, spare cash, one-off bills, upload log). See the privacy page for the list.

## Running locally

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the Supabase values.
3. `npm test` and `npm run build`
4. `npm run dev`. A Vite plugin serves `/api/ai`, `/api/stt`, `/api/tts` and `/api/market` locally, so chat and market data work. Sign in needs the Supabase auth providers enabled.
5. `npx vercel dev` runs the UI and the `api/` functions together as Vercel does. Requires `npx vercel login` and `npx vercel link`.

AI keys (`GEMINI_API_KEY`, optional `GEMINI_MODEL`, `GROQ_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, optional `UBOT_API_KEY`, `UBOT_API_URL`) go in `.env.local` for local runs and in Vercel project settings for deploys, never in the browser.

## Deploy on Vercel

1. Import `Ray0737/debtwise` in Vercel. The preset is Vite, `vercel.json` sets the build, the SPA rewrite, security headers, caching and function timeouts.
2. Project settings, Environment Variables. Browser: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Server only: `GEMINI_API_KEY`, `GEMINI_MODEL`, `GROQ_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, optional `UBOT_API_KEY`, `UBOT_API_URL`.
3. Supabase, Authentication, URL Configuration: set the Site URL and add the Vercel domain to Redirect URLs, and enable the Google provider.
4. Set the production branch to `main`.
5. Upload checks log one JSON line per file (`"evt":"upload"`). Search for it in the Vercel logs to watch for abuse.
