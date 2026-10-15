# Debtwise code map

| Where | What |
|---|---|
| `src/engine/` | Pure money logic with tests: format, mask, cashflow, plan, refinance, tax, deductions, guard |
| `src/data/sample/` | Labelled sample data: token events, offers, demo family |
| `src/store/` | `DataStore` interface, Supabase implementation, app state (zustand) |
| `src/lib/` | derive (summaries), facts (for the AI), group, validate, demo, ics, ai and voice clients |
| `src/i18n/` | Thai and English dictionaries, `tr` and `useT()` |
| `src/site/` | Public pages before login (landing, guide, get the app, get started, support, community, terms, privacy). same shell as the sign in page (navy header, white sheet, icon-only bottom dock) built from `src/ui.tsx`; `public/site/` holds the hero screenshots |
| `src/App.tsx`, `src/ui.tsx`, `src/styles.css`, `src/screens/` | UI: router and shell, shared components, one stylesheet (navy #292d7a, Inter, Bootstrap Icons), one file per screen |
| `api/` | Vercel functions: `ai` (extract and consult), `tts`, `stt`, shared `_lib` |
| `supabase/migrations/` | SQL schema with Row Level Security |
| `docs/` | Spec, plans, research |
