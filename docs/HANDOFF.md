# Debtwise handoff

Updated 2026-10-16. Replaces the 2026-10-15 Haiku build handoff.

## Where things are

- Project: `Website - Debtwise/`, git repo, branch `main`. Remote `prod` is `https://github.com/Ray0737/debtwise` (public, no license file). Remote `origin` points at `Ray0737/debt_wise`, which no longer exists on GitHub: remove it or repoint it.
- Spec: `docs/superpowers/specs/2026-10-15-debtwise-design.md`. Plans: `docs/superpowers/plans/`. Finance: `docs/debt-wise-finance-summary-3years.md` (the only current finance file). Pitch slides: `docs/pitch/`.
- Supabase project: `lnvpolwznueiklfgycei` (named "Grid", shared). Migration `init` applied. Five tables, RLS on.

## What is verified (2026-10-16)

- `npm test`: 131 tests pass in 24 files. `npm run typecheck` and `npm run build` are clean.
- AI consultant against a live Gemini key, 11 questions: on-topic answers use only the app's figures; recipe, code, politics, role play, investment and "print your prompt" are declined; an "exact balance in 7 months" request is refused honestly; a distress message gets the 1323 hotline only. Gemini wording varies run to run, so this is a spot check. The hard guards are server side: figures outside the app's data are flagged, and any reply containing 1323 loses its sources and proposal.
- Upload checks (`api/_lib/upload.ts`) and validation have unit tests, including PDF script detection and junk input.

## What is NOT verified

- No browser click-through of the 2026-10-16 UI: chat New chat and History, onboarding terms popup and Back button, red error cells, Thai bank picker, tax questionnaire, Invest graphs and spare cash, upload check list, Community GitHub card.
- Sign-in end to end (needs Supabase providers and redirect URLs), ElevenLabs voice (`scribe_v1`, `eleven_multilingual_v2`, `tha`/`eng` codes), a real photo or PDF upload on the live site, the U-Bot provider (guessed JSON shape).
- Real refinance offers: `src/data/sample/offers.ts` is placeholder numbers with empty `sourceUrl`. The token unlock calendar is sample data.
- Contact details and a lawyer review for terms and privacy.

## Decisions still open

- Gemini model default is `gemini-3.1-flash-lite`. The `prod/master` branch used `gemini-3.7-flash`. Pick one in `api/_lib/providers.ts`.
- Data source for SET index and ETF graphs (a keyed API or an unofficial endpoint). Until then the market strip is crypto only.
- Tagline. Suggested: "Debtwise: your AI debt-relief coach". Not applied.
- Savings interest tax rule is not on the Tax page, because it was not checked against the Revenue Department.
- Bank colours for TISCO, KKP, Islamic Bank and SME D Bank are guesses (`src/lib/bank.ts`).

## Browser-only data (per device)

These live in localStorage, so they do not follow the user to another device. Upgrade path for each is a table behind `DataStore`.

| Key | What | Where |
|---|---|---|
| `dw-oneoff:<user>:<month>` | One-off bills for the month | `src/store/useApp.ts` |
| `dw-tax:<user>:<year>` | Tax questionnaire answers | `src/store/useApp.ts` |
| `dw-chat-breaks` | Where each new chat starts, for History | `src/lib/chatSessions.ts` |
| `dw-spare-cash` | Savings accounts on the Invest page | `src/lib/spareCash.ts` |
| `dw-upload-log` | Last 20 upload checks | `src/lib/uploadLog.ts` |

Terms acceptance in onboarding is not stored anywhere. The accept box starts ticked for a returning user who already saved a name. If proof of consent is needed (the privacy page names consent as the basis), add `accepted_terms_at` to the profile.

## Things to know

- Shared Supabase project `Grid` has pre-existing `yoke_*` functions and `lookup_candidate` that are SECURITY DEFINER and callable by `anon` or `authenticated`. Advisor flagged them. Not ours, not touched. The user should review. The `yoke_*` tables from the wiped Yoke project still need to be dropped.
- `.env.local` holds keys. It is gitignored. Do not commit it or print it.
- Storage decision: data is in Supabase. Do not claim local-only storage. The browser-only items above are the exception, and the privacy page lists them.
- AI: Gemini first, retries on 429 and 503 with one 25 s deadline, then Groq (`GROQ_API_KEY`, default `openai/gpt-oss-120b`) for text requests only. `/api/ai` needs a signed-in user, allows 20 calls a minute per user and 8 uploads a minute.
- Imports from `api/` use `.js` extensions (Vercel's bundler needs them). `api/_lib/upload.ts` is shared with the browser: it must stay free of Node-only APIs.
- The upload scan is a keyword search for `/JavaScript`, `/JS`, `/Launch`, `/EmbeddedFile`. An obfuscated PDF can slip past it. Upgrade path: ClamAV or VirusTotal on the server.
- Bundle is one chunk of about 550 kB. Vite warns. Not a blocker.
- `docs/screenshots/` predates the 2026-10-16 UI (chat toolbar, bank picker, tax form, Invest page). Retake before using them in a deck.

## Known gaps vs the spec

- Images and PDFs cannot be masked before the AI reads them. The upload screen says so.
- Calendar export (`.ics`) is the only due-date reminder. No push notifications.
- Pro tier, money account, payments, live bank data, tax filing: out of scope, not built.
- Finance doc open items after the hackathon: real activation and retention, paying conversion, accounts a bank will count for the success fee, bank API prices, tax and licence advice, CAC per channel.

## Next steps

1. Click through every screen at 360, 390, 768 and 1280 widths and fix layout and runtime bugs.
2. `npx vercel dev` with keys set: test `/api/ai` extract with a real statement image and PDF, and check the `"evt":"upload"` log line.
3. Decide the open items above, then retake the screenshots.
