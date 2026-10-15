# Debtwise design 2

This file documents the look, the building blocks and the rules of the Debtwise interface as it is built today (React, Vite, one stylesheet). Design 1 was the earlier warm, bubble based look and is gone. Where this file and the code disagree, the code in `src/styles.css` is right, and this file should be fixed.

Contents

1. [Principles](#1-principles)
2. [Files](#2-files)
3. [Tokens](#3-tokens)
4. [Typography](#4-typography)
5. [Layout and the hero ratio](#5-layout-and-the-hero-ratio)
6. [Navigation](#6-navigation)
7. [Components](#7-components)
8. [Plain mode after login](#8-plain-mode-after-login)
9. [Pages](#9-pages)
10. [Interaction](#10-interaction)
11. [Icons](#11-icons)
12. [Thai and English](#12-thai-and-english)
13. [Responsive checks](#13-responsive-checks)
14. [Writing rules](#14-writing-rules)
15. [How to add things](#15-how-to-add-things)
16. [Known leftovers](#16-known-leftovers)

---

## 1. Principles

1. **Navy and white.** The main colour is dark blue `#292d7a`. Surfaces are white. Green `#8acd6e` is the one support colour, used for hover and soft accents. Red is only for serious buttons (delete). There are no other interface colours.
2. **Phone first, adaptive.** The reference is a phone: a navy header with a white rounded sheet rising over it. The same screens widen on tablet and desktop, where a sidebar replaces the bottom bar.
3. **Small text.** The base size is 13px. Buttons are small. Spacing does the work that size and weight do elsewhere.
4. **One weight.** LINE Seed Sans TH has a regular weight only. Every piece of text is weight 400. Hierarchy comes from size and colour, never from bold.
5. **Hover changes colour only.** No outline, no shadow, no lift. Keyboard focus gets the same colour change as hover.
6. **Icons carry meaning.** Bootstrap Icons everywhere, mostly line icons, with big icons in heroes.
7. **Numbers are real.** Every figure shown comes from the engine in `src/engine/`. The AI never computes money. Sample data is labelled `sample`.
8. **Plain where it reads.** Long text and lists are clean lines with hairlines, not stacks of bubbles.

---

## 2. Files

| File | What it holds |
|---|---|
| `src/styles.css` | The only stylesheet. Tokens, layout, components, sidebar, plain mode |
| `src/ui.tsx` | Shared pieces: `Icon`, `LangButton`, `Page`, `Card`, `Row`, `Badge`, `Modal`, `Field`, `NumInput`, `TextInput`, `Seg`, `Choice` |
| `src/App.tsx` | Router, the signed-in shell (sidebar and tab bar), the sign-in gate |
| `src/screens/` | One file per signed-in screen, plus `SignIn.tsx` and `Onboarding.tsx` |
| `src/site/Site.tsx`, `src/site/pages.tsx` | The public pages: `PublicPage`, `PublicDock`, and the page content in Thai and English |
| `src/lib/bank.ts` | Thai bank brand colours for lender tiles |
| `public/fonts/lineseedsansth_rg.woff2` | The font, self hosted |
| `public/site/` | Hero screenshots for the landing page (demo data) |
| `public/icon.svg`, `logo-white.svg`, `logo-mark.svg` | Brand marks |

Only `styles.css` styles the app. The older `site.css` was deleted when the public pages moved to the same shell as the app.

---

## 3. Tokens

All tokens are CSS custom properties on `:root`.

### Colour

| Token | Value | Use |
|---|---|---|
| `--main` | `#292d7a` | Header, primary buttons, text, active pills, navy cards |
| `--main-hover` | `#3d42a3` | Hover of navy buttons and of the bottom bar |
| `--bg` | `#ffffff` | Page and sheet |
| `--tint` | `#ffffff` | Panels. White since design 2; kept as a token so a tint can return |
| `--tint-hover` | `#8acd6e` | Hover fill of rows, soft buttons, switches, picker cells |
| `--green` | `#8acd6e` | Support colour |
| `--green-soft` | `#e4f3dc` | Icon tiles behind row icons |
| `--muted` | `#5a5e91` | Secondary text |
| `--line` | `rgba(41,45,122,.14)` | Hairlines and borders |
| `--danger` | `#c62828` | Delete buttons (hover `#a31f1f`) |
| `--on-green` | `#000000` | Text on the light green hover |

Colours used directly:

- The desktop sidebar background is `--main`. Its panels are `#20245f`, a darker navy.
- White at 8 to 30 percent on navy for hover fills and hairlines inside the header, sidebar and navy cards.
- Bank colours from `lib/bank.ts` (see 7.8).

### Contrast rule for the green

Light green gets black text. A dark green, if one is ever added, gets white text. The navy bottom bar is the exception: its hover is dark blue with a white icon, never green.

### Spacing and shape

| Token | Value |
|---|---|
| `--s1` to `--s5` | 4, 8, 12, 16, 24px |
| `--tabs-h` | 60px, height of the bottom bar |
| Radii | 10px buttons and inputs, 12px rows, 16px cards, 22px sheet top, 999px pills and circles |
| `--ease` | `0.16s ease` for every colour change |

Every gap in the app is one of the five spacing steps.

---

## 4. Typography

**Family.** LINE Seed Sans TH, self hosted, for Latin and Thai text, on every screen (public and signed in). Inter Variable and the system Thai fonts are fallbacks only. A global rule forces weight 400 and turns off faux bold: `*{font-weight:400 !important; font-synthesis:none}`. Do not add bold.

**Scale** (root size 13px, so `1rem` is 13px):

| Element | Size |
|---|---|
| Body, inputs, buttons | 1rem, buttons `.92rem` |
| `.small` | `.85rem` |
| `h1` | `1.15rem` |
| `h2` | `1rem`, `1.15rem` inside documents, `1.25rem` for document sections |
| Header title | `1.2rem` |
| `.big` (hero headline, key number) | `clamp(1.8rem, 7.4vw, 2.4rem)`, `clamp(1.7rem, 7.4vw, 2rem)` under 400px |

Line height is 1.5, and 1.6 when the page is Thai so tone marks do not collide. On touch screens inputs are 16px so iOS does not zoom.

---

## 5. Layout and the hero ratio

Every screen is a **header and a sheet**.

- The **header** (`.top`) is navy with a faint ring pattern in the top right. It holds the top bar (back button, title, actions) and the hero (small label, big number or headline, optional button).
- The **sheet** (`.sheet`) is white with a 22px rounded top that overlaps the header by 24px. Content sits in a centred column (`.col`).

### Column widths

| Width | Column |
|---|---|
| Phone | 480px max, 16px gutters |
| 720px and up | 640px max, 24px gutters |
| 1024px and up | 720px max |
| Sign in and onboarding | 440px, 460px from 1024px |

### Hero ratio (class `half`)

Sign in, onboarding and every public page use `.main.half`. The navy header has a minimum height, and the hero text sits low, just above the white edge, with room above it.

| Screen | Navy height |
|---|---|
| Phone and tablet, under 1024px | 52% of the screen (`52dvh`) |
| Desktop, 1024px and up | 40% (`40dvh`) |
| Short screens under 560px tall | Header shrinks to its content |

Signed-in screens (Home, Debt and so on) use a header that is only as tall as its hero, because they carry content.

The hero always has 24px of space under the top bar, so a long headline never touches it.

### Public pages versus the app shell

| | Public pages and sign in | Signed in |
|---|---|---|
| Bottom bar | Icon dock, visible at every width | Tab bar, phone and tablet only |
| Sidebar | None | Desktop only (1024px and up) |
| Main offset | 0 | 288px on desktop |

---

## 6. Navigation

### 6.1 Bottom bar (`.tabs`)

Icon only, 60px high, white with a hairline on top.

- Each item is an icon in a pill. The active item is a navy pill with a white icon.
- Hover is dark blue (`--main-hover`) with a white icon. Never green.
- Every item has an `aria-label` and a `title`.
- **Signed in (phone and tablet):** Home, Chat, Invest, Tax, Debt, Profile.
- **Public (`PublicDock`, all widths):** Home, Guide, Get started, Support, Community, and the last item is Sign in (door arrow) or Open app when signed in.

### 6.2 Header actions

Top right of every header, in this order: the page's own action (for example the plus on Debt), then the language pill, then the sign out circle when signed in. The sign out circle is hidden on desktop because the sidebar has one.

The **language pill** (`.langpill`) is a globe icon, `TH` and `EN`, with the current language in a white pill. One click switches.

### 6.3 Desktop sidebar (1024px and up)

288px wide, background `--main`, built from stacked rounded panels in dark navy `#20245f`, 10px apart.

1. **User panel.** Photo (the Google picture, or the initial in a white circle if there is none or it fails to load), name, email, a sign out icon. Below it the language switch.
2. **Menu panel.** Home, Invest, Tax, Debt, Profile. 34px rows. Debt shows the number of debts. The active row is a white pill with navy text. Hover is a lighter navy.
3. **By bank panel** (folds). One row per lender with its bank colour and a compact total (`2M`, `380K`). Each opens that lender.
4. **Shortcuts panel** (folds, closed by default). See the plan, Add a debt.

The language switch in the sidebar uses the full words `ไทย` and `English`, two equal halves, white pill on the active one.

---

## 7. Components

### 7.1 Buttons

Small. `7px 14px` padding, `.92rem` text, 10px radius, icon and text 6px apart.

| Variant | Look | Hover |
|---|---|---|
| default | Navy fill, white text | `--main-hover` |
| `soft` | White, hairline border, navy text | Green, black text |
| `light` | White, for use on navy | Green |
| `danger` | Red fill, white text | Darker red |
| `block` | Full width, 40px minimum height (equals an input) | |
| `icon` | Square with a single icon | |

### 7.2 Header circle and tab icons

32px circles for header actions. White at 16% on navy, 30% on hover.

### 7.3 Inputs and fields

40px minimum height, 10px radius, hairline border that turns navy on hover and focus. A `.field` stacks a small muted label over the input, with an error line in red under it.

- `Seg`: a switch of two to three options. The selected one is a navy pill.
- `Choice`: a button that opens a popup picker. Pickers: day of month (a round-cell calendar grid, seven columns), birth year (a scrolling grid, four columns, opens on the selected year), debt type (a list).

### 7.4 Popups

`Modal`: a bottom sheet on phones, a centred card (400px) on desktop. Dim background, Escape and a tap outside close it. The scroll bar inside is custom.

### 7.5 Scroll bar

8px, rounded thumb in navy at 30%, solid navy on hover. Falls back to the standard thin bar in browsers without the pseudo elements.

### 7.6 Cards, rows and badges

- `Card`: white, hairline border, 16px radius, 12px padding. A `navy` variant is a gradient from `#3b40a3` to `#20245f` with the header's ring pattern, for calls to action.
- `Row`: white row, 48px minimum height, optional icon tile (32px, soft green), title, small muted second line, a value on the right and a chevron when it is a link. Hover turns the whole row green with black text and a black chevron.
- `Badge`: a pill with an icon. `verified` is navy, `needs review` and `sample` are outlined, `user stated` is plain.

### 7.7 Chat

- **Composer:** one pill containing a chat icon, the text field, a mic button and a send button. Mic is a white circle that turns navy on hover and while recording. Send is a navy circle with an up arrow, faded until there is text. Clicking into the bar gives it a green outline.
- **Messages:** see 8.

### 7.8 Bank colours

`lib/bank.ts` maps a lender name (English or Thai) to an approximate brand colour for the icon tile on the by bank list and the dot in the sidebar:

KBank green, SCB purple, Bangkok Bank blue, Krungthai light blue, Krungsri yellow (dark icon), ttb orange, GSB pink, GHB orange, BAAC green, UOB dark blue, CIMB maroon, LH Bank blue, student loan fund teal. Unknown lenders stay on the soft green tile. Tiles with a brand colour keep a white icon; every other row icon is black.

---

## 8. Plain mode after login

The signed in app (not the public pages, sign in or onboarding) uses clean lines instead of boxes. The rule is in `styles.css` under "Signed-in app: plain lists and chat" and is scoped with `.main:not(.pub):not(.solo)`.

- **Cards** lose their fill, border, radius and padding. Neighbouring cards are separated by a hairline.
- **Rows** lose their fill and border and become lines with a hairline under each. The whole line turns green on hover.
- **Chat** has no bubbles. Each message is a block of text with a hairline between messages. The user's messages have a thin navy bar on the left. The consultant's replies sit plain under a small `AI` label.
- **Kept as boxes on purpose:** inputs, switches, buttons, the refinance result, and the consultant's proposed change, because each is a control or a result to look at.

Public document pages (Guide, Terms, Privacy) are also plain: sections are text under a heading, separated by a hairline, with a plain row of section links at the top (the section being read is underlined) and notes drawn with a thin navy bar on the left. The other public pages (landing, Get started, Support, Community, Get the app) keep their cards.

---

## 9. Pages

### Signed in (`src/screens/`)

| Route | Screen |
|---|---|
| `/` | Home: this month at a glance (what is left or short, next due date), the summary lines, the plan, add debt and calendar buttons, and a coming-up list of due dates |
| `/chat` | Chat: the consultant on its own page, with the engine's first line, replies with source links and proposals to apply |
| `/debt` | Total owed and monthly payments, by bank or by type |
| `/debt/group/:by/:key` | Loans inside one bank or type |
| `/debt/loan/:id` | Loan detail, source and badge, edit and delete |
| `/debt/add` | Upload, talk or form |
| `/debt/review` | Check every extracted number against its source line |
| `/plan` | This month's plan and refinance check |
| `/invest` | Token events and watchlist (sample) |
| `/tax` | Tax estimate and allowances (sample) |
| `/profile` | Edit profile, language, data export, demo data, delete all, sign out |
| `/onboarding/1` to `5` | About you, income, work horizon, essentials, debts. A big icon for each step sits in the hero |

### Public

| Route | Page |
|---|---|
| `/` (signed out) | Landing: headline, two app screenshots, feature rows, call to action |
| `/guide` | Every part of the app, step by step |
| `/install` | Get the app: it is a web app, how to add it to a home screen |
| `/start` | Get started: four steps and what to have ready |
| `/support` | Where to look, the prototype notes, what is new |
| `/community` | Feedback and the hackathon note |
| `/terms`, `/privacy` | Drafts that match how the app works |
| `/signin` | Google or an email link |

A signed in visitor who opens a public path sees the public page, and `/` is the app.

---

## 10. Interaction

**Hover and keyboard focus** (nothing else is allowed):

| Element | Change |
|---|---|
| Row, soft button, `Seg` option, picker cell | Fill turns green `#8acd6e`, text black |
| Navy button | Fill becomes `--main-hover` |
| Bottom bar item | Fill becomes `--main-hover`, icon white |
| Section links on document pages | Underline appears, text navy |
| Sidebar item and header circle | White at a higher opacity |
| Delete button | Darker red |
| Chat bar | Green outline when focused |

**Motion.** Colour changes take `.16s`. The popup rises in `.18s`. Reduced motion turns every animation and transition off.

**Focus.** There are no outline rings. Never remove the hover colour change from a control, because it is also the focus state.

---

## 11. Icons

Bootstrap Icons through the `bootstrap-icons` package, used as `<Icon n="name" />` (a `<i class="bi bi-name">`). The font is bundled, so nothing loads from another site.

- Row tile icons are 1rem and black on a soft green tile.
- Big hero icons (onboarding) are 2.4rem in a 72px white tile at 16%.
- Bottom bar icons are 1.3rem.
- Landing, Guide and the other public pages use the same set.

Icons never replace words in a button unless the button has an `aria-label` and a `title`.

---

## 12. Thai and English

Thai is the default, English is one click away. The choice is saved in the browser (`dw-lang`) and in the profile, and sets `<html lang>`.

- **App text** lives in `src/i18n/en.ts` and `th.ts`. A test fails if a Thai key is missing, if a value is empty, if a `{placeholder}` differs between the languages, or if any text contains an em dash.
- **Public page text** lives next to the markup in `src/site/pages.tsx` as `{ th, en }` pairs read through `useL()`.
- Names and technical terms (Debtwise, Google, Supabase, ElevenLabs, TH, EN) stay in English in both languages.

---

## 13. Responsive checks

Design at 390px first, then check 360, 768, 1280 and 1440. There must be no sideways scroll on any page. Also check a very short screen (632 by 375) for the hero.

- Grids collapse to one column on phones.
- Long names truncate with an ellipsis, long sentences wrap.
- Flex children that hold text use `min-width: 0`.
- Tap targets are at least 40px tall.

---

## 14. Writing rules

- Plain, short sentences. Say what a thing does, then stop.
- No em dash. No all caps. No bold. No exclamation marks.
- Sentence case for headings and buttons.
- Say `sample` wherever data is not real, and keep the label visible.
- Never say a number is safe or tell the user what to do. Say what the numbers show and what the options are.
- Terms and privacy are drafts. Facts in them must stay true to the app (data in Supabase with Row Level Security, files not stored, masked text to the AI, voice through ElevenLabs).

---

## 15. How to add things

### A signed in screen

Add `src/screens/Name.tsx`, wrap it in `<Page title back hero>`, use `Card`, `Row` and the `kv` lines, add the route in `App.tsx`, and add the strings to both languages.

### A public page

Add a component in `src/site/pages.tsx` that returns `<PublicPage title sub>`, write the text as `{ th, en }` pairs, and add the route in `App.tsx`. For long text use the `Doc` helper so it gets the plain document look and the section links.

### A new colour

Do not. If something needs emphasis use size, the navy fill or the green hover.

### A new icon

Pick one from Bootstrap Icons. Add an `aria-label` if it stands alone.

### Text for a new string

Add the key to `en.ts` and `th.ts`, with the same placeholders.

---

## 16. Known leftovers

- `.linefont`, `.side-ico`, `.langpill` inside the sidebar and the older `.circle.txt` are no longer used by every screen. Delete them when convenient, then check each page at 390px and 1440px.
- The public pages repeat a few Thai and English sentences that also exist in the app dictionaries. They could share keys.
- The hero screenshots in `public/site/` use the demo family with real bank names swapped in. Retake them when the app changes noticeably.
- Tokens still named `--tint` and `--tint-hover` are now white and green. Rename them to `--surface` and `--accent` if the names start to confuse.
