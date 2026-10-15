# Debtwise code map

| Where | What |
|---|---|
| `src/engine/` | Pure money logic with tests: format, mask, cashflow, plan, refinance, tax, deductions, guard |
| `src/data/sample/` | Labelled sample data: token events, offers, demo family |
| `src/store/` | `DataStore` interface, Supabase implementation, app state (zustand) |
| `src/lib/` | derive (summaries), facts (for the AI), group, validate, demo, ics, ai and voice clients |
| `src/i18n/` | Thai and English dictionaries, `tr` and `useT()` |
| `src/App.tsx` | Placeholder. The UI is being redesigned |
| `api/` | Vercel functions: `ai` (extract and consult), `tts`, `stt`, shared `_lib` |
| `supabase/migrations/` | SQL schema with Row Level Security |
| `docs/` | Spec, plans, research |
