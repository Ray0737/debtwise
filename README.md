# Debtwise

Debt support app for normal Thai users. See all debts by bank and type, get a plan you can afford, check refinancing, and talk to an AI consultant. Phone first, adaptive to desktop. Built for U-Hackathon 2026 (Track 1, AI).

## Status

Logic, data and API are built and tested. All UI (screens, components, styles, DESIGN.md) was removed on purpose for a redesign. Not yet run end to end against live Supabase and AI keys.

## Docs

- `docs/superpowers/specs/2026-10-15-debtwise-design.md` : what we build and why
- `docs/superpowers/plans/` : implementation plan
- `docs/debt-app-idea-summary.md` : idea and market research
- `CODEMAP.md` : where things live once code exists

## Stack

React, TypeScript, Vite, PWA, Supabase (Auth and Postgres), Vercel (hosting and serverless functions), Gemini API, ElevenLabs, Vitest.

## Setup (after the plan is executed)

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the Supabase values. AI keys go in Vercel project settings, not in the browser.
3. `npm run dev`
4. `npm test`

## Rules

- The browser holds only the Supabase URL and anon key. Never put a `service_role` or AI key in client code.
- Money figures come from the engine in `src/engine`, never from the AI.
- Sample data is always labelled `sample`.

## Running locally

1. `npm install`
2. `npm test` and `npm run build`
3. `npm run dev` for the UI only. Sign in needs Supabase auth providers enabled.
4. `npx vercel dev` runs the UI and the `api/` functions together. Requires `npx vercel login` and `npx vercel link`.

AI keys (`GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, optional `UBOT_API_KEY`, `UBOT_API_URL`) go in Vercel project settings, not in the browser.

## Deploy on Vercel

1. Import `Ray0737/debt_wise` in Vercel. The preset is Vite, `vercel.json` sets the build, the SPA rewrite, security headers, caching and function timeouts.
2. Project settings, Environment Variables. Browser: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Server only: `GEMINI_API_KEY`, `GEMINI_MODEL`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, optional `UBOT_API_KEY`, `UBOT_API_URL`.
3. Supabase, Authentication, URL Configuration: set the Site URL and add the Vercel domain to Redirect URLs, and enable the Google provider.
4. Every push to `master` deploys to production.
