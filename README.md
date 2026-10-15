# Debtwise

Debt support app for normal Thai users. See all debts by bank and type, get a plan you can afford, check refinancing, and talk to an AI consultant. Phone first, adaptive to desktop. Built for U-Hackathon 2026 (Track 1, AI).

## Status

Design and plan stage. Code not started.

## Docs

- `DESIGN.md` : UI design system (palette, nav, screens, components)
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
