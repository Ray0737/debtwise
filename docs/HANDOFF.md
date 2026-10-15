# Debtwise handoff

Written by the Haiku build run, 2026-10-15, for a higher-capability model to review, fix and finish.

## Where things are

- Project: `Website - Debtwise/`, git repo, branch `master`, 14 commits from scaffold to deploy config.
- Plans followed in order: `docs/superpowers/plans/2026-10-15-debtwise-part1-foundation-engine.md`, `...part2a-app-shell.md`, `...part2b-ai-and-finish.md`.
- Spec: `docs/superpowers/specs/2026-10-15-debtwise-design.md`. UI rules: `DESIGN.md`.
- Supabase project: `lnvpolwznueiklfgycei` (named "Grid", shared). Migration `init` applied. Five tables, RLS on.

## What is verified

- `npm test`: 91 unit tests pass (engine, masking, formatting, tax, refinance, plan, guard, store mapping, i18n parity, validation, debt grouping, consultant facts, calendar export, AI parsing and prompt-injection cases, demo loader).
- `npm run typecheck`: clean, includes `api/`.
- `npm run build`: passes. PWA service worker and manifest are generated.
- `npx vite preview` serves `/` and `/signin` with HTTP 200 (preview server was started on port 4173).
- Supabase: tables exist, RLS enabled on all five, security advisor reports nothing on them.

## What is NOT verified

- No browser run. Screens have never been clicked through. Expect layout and runtime bugs.
- Sign-in has not been tested. Needs Supabase Auth providers (Email, Google) and redirect URLs enabled in the dashboard.
- No AI call has been made. Needs `GEMINI_API_KEY` in Vercel env and `vercel dev` to exercise `/api/ai`.
- ElevenLabs STT/TTS: model name `scribe_v1`, `eleven_multilingual_v2`, and language codes `tha`/`eng` are unverified.
- Gemini model comes from `GEMINI_MODEL` (default `gemini-3.1-flash-lite`, confirmed live 2026-10-15; `gemini-2.5-flash` is retired for this key).
- U-Bot provider is a guessed JSON shape. Not connected to any real interface.
- Tokenomist, Thai tax rules and deduction amounts are sample data only, labelled `sample`.
- Refinance offers in `src/data/sample/offers.ts` are placeholder numbers with empty `sourceUrl`.

## Manual steps for the user

1. Supabase dashboard: Authentication, Providers: enable Email and Google. Add `http://localhost:5173`, `http://127.0.0.1:4173` and the Vercel URL to redirect URLs.
2. Vercel: `npx vercel login`, `npx vercel link`, then set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, and optionally `UBOT_API_KEY`, `UBOT_API_URL`. Also `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the build. Then `npx vercel deploy --prod`.
3. Replace placeholder offers in `src/data/sample/offers.ts` with public rates, each with a real source URL and date.
4. Verify before any demo claim: Gemini model name, ElevenLabs Thai STT, Tokenomist access and terms, official Thai tax rules and deduction amounts.

## Issues to know about

- Shared Supabase project `Grid` has pre-existing `yoke_*` functions and `lookup_candidate` that are SECURITY DEFINER and callable by `anon` or `authenticated`. Advisor flagged them. Not ours, not touched. The user should review.
- Shared project also has extensions `cube`, `earthdistance`, `btree_gist` in `public`. Advisor warning only.
- `.env.local` holds the Supabase anon key. It is gitignored. Do not commit it. Do not print it.
- Storage decision: data is in Supabase only for now. The DataStore interface allows a local store later, not built. Do not claim local-only storage.
- Home's consultant is a notice line plus chat. The first-message notice is built from engine numbers. Monthly plan snapshot is saved on first open of each month.
- `api/_lib/prompts.test.ts` lives under `api/` and runs under vitest. Vercel may treat `api/_lib` as non-function (underscore prefix is the convention, so it should be fine). Verify on first `vercel dev`.
- Relative imports from `api/` into `src/engine/` have no `.js` extension. Vercel's bundler may need them. If deploy fails with a module resolution error, add extensions or move the shared code.
- Bundle is about 548 kB, one chunk. Vite warns. Not a blocker.

## Known gaps vs the spec

- No rate limiting on `/api/*` beyond requiring a signed-in user.
- Uploaded images and PDFs cannot be masked before the AI reads them. The upload screen says so.
- PWA icon is SVG only. iOS home screen needs PNG icons later.
- Calendar export (`.ics`) is the only due-date reminder. No push notifications.
- Invest and Tax tabs are read-only sample data.
- Pro tier, money account, payments, live bank data, tax filing: out of scope, not built.

## Next steps for the reviewer

1. Run `npx vite preview` (or `npm run dev`) and click through: sign in, onboarding, add debt by form, load demo family, Home consultant, Plan, Debt by bank and by type, Invest, Tax, Profile. Fix layout and runtime errors at 360, 390, 768 and 1280 widths.
2. Run `npx vercel dev` with keys set, then test `/api/ai` extract and consult with a real key. Check the masked payload in the response.
3. Upload one synthetic statement (image) and confirm the review screen shows extracted values with source lines.
4. Inject a malicious PDF text and confirm no balance changes without user confirmation.
5. Review the `api/` functions for auth, logging and error leakage.
6. Commit the fixes. Haiku used `Co-Authored-By: Claude Haiku 5.5`.
