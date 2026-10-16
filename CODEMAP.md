# Debtwise code map

| Where | What |
|---|---|
| `src/engine/` | Pure money logic with tests: format, mask, cashflow, plan, refinance, tax, deductions (and `allowanceTotal` for the tax questionnaire), guard |
| `src/data/sample/` | Labelled sample data: token events, offers, demo family |
| `src/data/public/` | Public Bank of Thailand programme text and sources the consultant may cite |
| `src/store/` | `DataStore` interface, Supabase implementation, app state (zustand: one-off bills, tax answers, language) |
| `src/lib/` | derive (summaries), facts (for the AI), group, validate (names, labels, whole numbers), demo, ics, ai and voice clients, bank (Thai bank list, colours, icons), chatSessions (chat split for History), spareCash, uploadLog, market client |
| `src/i18n/` | Thai and English dictionaries, `tr` and `useT()` |
| `src/site/` | Public pages before login (landing, guide, get the app, get started, support, community, terms, privacy). Same shell as the sign in page (navy header, white sheet, icon-only bottom dock) built from `src/ui.tsx`; `public/site/` holds the hero screenshots. `docs.tsx` holds the guide, terms and privacy text and can render terms and privacy bare for the onboarding popup |
| `src/App.tsx`, `src/ui.tsx`, `src/styles.css`, `src/screens/` | UI: router and shell, shared components (Field with red error cell, Sparkline, Modal), one stylesheet (navy #292d7a, Inter, Bootstrap Icons), one file per screen. `Consultant.tsx` is the chat, `SpareCash.tsx` sits on the Invest page |
| `api/` | Vercel functions: `ai` (extract and consult), `tts`, `stt`, `market`; shared `_lib` (prompts and the consultant rules, providers with Groq fallback, market mapping, `upload.ts` file checks shared with the browser) |
| `supabase/migrations/` | SQL schema with Row Level Security |
| `docs/` | Handoff, finance plan, pitch slides, spec, plans, research, screenshots |
