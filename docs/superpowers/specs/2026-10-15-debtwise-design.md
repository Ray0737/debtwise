# Debtwise: design spec

Date: 2026-10-15. Event: U-Hackathon, Track 1 (AI). Status: draft for the build plan.
Companion files: `DESIGN.md` (UI system), `docs/debt-app-idea-summary.md` (idea and research).

## 1. Purpose

Debtwise helps a normal Thai person see all their debts in one place, understand what they can afford to pay, check whether refinancing is worth it, and talk through a life event with an AI consultant. Lead demo person: a family with a single earner.

Success for the event:
- A working end to end loop on a phone and on desktop: sign in, onboard, add debts (upload with review, talk, or form), see debt by bank and by type, get a plan, check a refinance, talk to the consultant.
- Every number shows its source and a status badge.
- Numbers are computed in code, never by the AI.
- Invest and Tax tabs exist with labelled sample data.

Rubric: 40% app execution, 40% practical use, 10% usability, 5% innovation and ecosystem, 5% U-Bot or ElevenLabs.

## 2. Decisions (from the brainstorm)

| Topic | Decision |
|---|---|
| Name | Debtwise |
| Platform | React PWA, phone first, adaptive to desktop. One codebase |
| Language | Thai default, English toggle |
| Auth | Supabase Auth: Google OAuth, email as alternative |
| Data | Supabase Postgres now, behind one `DataStore` interface so a local (IndexedDB) store can be added later |
| AI | Gemini API as the main model, behind a provider interface. ElevenLabs for voice. U-Bot as an optional alternative provider if docs or a key are available |
| Secrets | Vercel environment variables, read only by serverless functions in `/api` |
| Input | Statement upload with a review screen, guided conversation by voice or text, manual form |
| Debt types | Credit card, personal and nano loan, car or motorbike, home, student loan, informal |
| Tabs | Home, Invest, Tax, Debt. Profile from the avatar |
| Invest and Tax | Full layout and flows with sample data, every block labelled `sample` |
| Pro / free | Not built. Business model is a slide only |
| Out of scope | Money account, payments, live bank connections, tax filing, trading, light theme |

## 3. Architecture

```
Browser (React PWA)
  UI screens  ->  state (zustand)  ->  DataStore interface  ->  SupabaseStore (now) | LocalStore (later)
       |                                      
       +--> /api/ai   (Vercel function)  ->  provider interface -> Gemini | U-Bot
       +--> /api/tts  (Vercel function)  ->  ElevenLabs
       +--> /api/stt  (Vercel function)  ->  ElevenLabs (fallback: typed input)
Engine (pure TypeScript, no I/O): plan, refinance, cash flow, tax estimate, masking
Supabase: Auth, Postgres with Row Level Security
```

Rules:
- The browser holds only the Supabase URL and anon key. The anon key is public by design and safe only because every table has Row Level Security. No `service_role` key ever goes in the client.
- AI keys live only in Vercel environment variables. `/api` functions store nothing and log no request bodies.
- Before any text leaves for the AI, a masking function removes account numbers, phone numbers, national ID numbers and names. The masked payload is what the user can view in the activity log.
- The AI never computes money figures. It reads figures produced by the engine and explains them, or it extracts figures from a document for the user to confirm.
- Documents are data, never instructions. Extraction prompts treat file content as untrusted.
- Statement files are not stored in v1. We store extracted values plus a source reference (file name, page, the source line text).

## 4. Data model (Postgres, all tables have `user_id` and Row Level Security: a user reads and writes only their own rows)

| Table | Purpose | Main columns |
|---|---|---|
| `profiles` | Onboarding and profile data | `user_id` pk, `display_name`, `birth_year`, `household_size`, `income_type`, `monthly_income`, `other_income`, `pay_day`, `retire_age` or `retire_year`, `post_retire_income`, `monthly_essentials`, `lang`, `onboarded_at` |
| `debts` | One row per loan | `id`, `user_id`, `lender`, `type` (credit_card, personal, car, home, student, informal), `label`, `balance`, `rate_pct`, `min_payment`, `due_day`, `term_months_left`, `status` (verified, needs_review, user_stated), `source_id`, `created_at`, `updated_at` |
| `sources` | Where a value came from | `id`, `user_id`, `kind` (upload, voice, form, sample), `file_name`, `page`, `line_text`, `confidence`, `created_at` |
| `plans` | Saved plan snapshots | `id`, `user_id`, `month`, `inputs` jsonb, `result` jsonb, `created_at` |
| `messages` | Consultant history | `id`, `user_id`, `role`, `content`, `masked_payload` jsonb null, `created_at` |

Indexes: `(user_id)` on every table, `(user_id, lender)` and `(user_id, type)` on `debts`, `(user_id, created_at desc)` on `messages`.
Migrations live in `supabase/migrations/` as SQL files and are applied to the Supabase project `lnvpolwznueiklfgycei` (named `Grid`, currently empty).

`DataStore` interface (TypeScript): `getProfile`, `saveProfile`, `listDebts`, `saveDebt`, `deleteDebt`, `saveSource`, `listMessages`, `addMessage`, `savePlan`, `hasPlan`, `deleteSampleData`, `exportAll`, `deleteAll`. Screens never import Supabase directly.

## 5. Engine (pure functions, unit tested)

| Module | Function |
|---|---|
| `cashflow` | Income, essentials, debt minimums, tax set aside, what is left, shortfall |
| `plan` | Allocate available money: essentials first, then all minimums, then extra to the highest rate (avalanche). Optional snowball. Returns per debt amount, reason and payoff estimate |
| `refinance` | Net saving of switching to an offer: new payments over the remaining term minus old, minus fees, penalty and insurance. Returns saving or loss and every input |
| `tax` | Thai personal income tax estimate from a rules table for a tax year. Returns tax due, assumptions and missing information. Rules table is sample data until verified |
| `deductions` | Checklist of allowances the user may qualify for with estimated saving, rule reference and year. Sample data until verified |
| `mask` | Remove account numbers, phone numbers, national IDs and names from text |
| `format` | Baht format, Buddhist era dates in Thai |

## 6. AI features

1. **Extract** (`/api/ai` action `extract`): masked document text or an image in, JSON of candidate values out (lender, type, balance, rate, minimum payment, due date), each with a source line and a confidence. Never saved until the user confirms on the review screen.
2. **Consult** (`/api/ai` action `consult`): the user message plus the engine output in, a plain language reply out. A message that changes an input (for example `tuition 15000 due this month`) returns a proposed change that the user confirms before it is saved and the engine reruns.
3. **Voice**: ElevenLabs text to speech for replies, speech to text for input. Text is always available. Test Thai quality first.
4. **Provider interface**: `generate({system, messages, schema?})`. Implementations: Gemini (default) and U-Bot (only if available).

Guard rails in the system prompt and in code: say what the numbers show and what the options are, never `safe`, never `you should`, always label estimates. A reply that contains a money figure not present in the engine output is flagged and not shown as fact.

## 7. Screens and routes

| Route | Screen |
|---|---|
| `/signin` | Google and email sign in, language toggle |
| `/onboarding/:step` | Five steps (about you, income, retirement, essentials optional, debts). Required before the app opens |
| `/` | Home: a summary card on top, the consultant conversation below. This is the heart of the app |
| `/invest` | Token events (sample Tokenomist data) |
| `/tax` | Tax estimate and ways to reduce it (sample rules) |
| `/debt` | Debt by bank or by type |
| `/debt/:group` | Loans inside a bank or a type |
| `/debt/loan/:id` | Loan detail with source and badge |
| `/debt/add` | Choose upload, talk or form |
| `/debt/review/:sourceId` | Review extracted values against source lines |
| `/plan` | This month's plan and refinance check |
| `/talk` | Redirects to `/` |
| `/profile` | Edit personal info, income, retirement, essentials, language, data export and delete, sign out |

Look and feel: see `DESIGN.md`.

## 8. Sample and demo data

- `src/data/sample/` holds the Tokenomist events, tax rules, deduction checklist and refinance offers. Each record has `source_label`, `source_url` and `as_of` fields, and the UI shows the label `sample`.
- A `Load demo family` action in Profile inserts a demo single earner family with credit card, personal loan, car loan, home loan and a student loan. Rows are marked source kind `sample`. A `Remove demo data` action deletes them.

## 9. Testing

- Vitest unit tests for the engine, masking, formatting and translation key parity (every Thai key has an English key and the reverse).
- A seeded scenario test: the demo family produces a known shortfall, plan and refinance result.
- Manual checklist for UI: 360, 390, 768, 1280 widths, Thai and English, keyboard, reduced motion.
- A planted malicious PDF text sample checks that extraction ignores injected instructions.

## 10. Risks and answers

| Risk | Answer |
|---|---|
| Wrong number gives harmful advice | Engine computes, review screen confirms, source line shown, estimate labels |
| Tax and invest are advice-adjacent | Information wording, sample label, rule reference and year, no personal recommendations to buy or sell |
| Tokenomist access unverified | Sample data behind an interface, swap when access is confirmed |
| U-Bot interface unknown | Optional provider, not required for the build |
| Thai OCR and voice quality | Review screen, typed input always available, test early |
| Supabase project is shared name `Grid` | It is empty. Do not touch other projects. Only create the tables in section 4 |
| Existing-project rule | New repo, commits start at the event, no code copied from earlier projects. Tooling reuse is fine |
| Data location claims | The UI and pitch say data is stored in Supabase for now. No local-only claim until the local store ships |

## 11. Out of scope for this build

Money account and payments, live bank or credit bureau connections, real tax filing, trading, subscription billing, light theme, offline editing beyond cached reads.

## 12. Heart of the app (decided)

- **Heart:** the consultant. Home is the conversation about the person's own numbers, with a short summary card on top (what is left this month or what is short, next due, plan, add debt, calendar).
- **Return hook:** due dates and a monthly plan refresh. The first open of each month saves a plan snapshot and the consultant says it rebuilt the plan. A calendar file (`.ics`) exports monthly due dates. Push notifications are roadmap.
- **Invest and Tax:** add-ons on top of the debt core, shown as tabs with labelled sample data. They are a possible Pro tier on a slide only.
- **Stage moment:** upload a statement, check each number on the review screen, land on Home where the consultant says what was added and where the month stands, then ask a question and show the plan and refinance check.
