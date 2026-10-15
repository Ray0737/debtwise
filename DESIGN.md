# Debtwise design system

Phone-first design for the Debtwise app (React PWA, adaptive to tablet and desktop). It replaces the Taskmaster website design that used to sit in this file. The old file is kept as `DESIGN.taskmaster-reference.md` for reference only.

Status: draft, second palette (Palladian light theme). Items marked **pending** wait for a decision, listed in section 14.

Contents

1. Principles
2. Palette and tokens
3. Typography
4. Shape, spacing and motion
5. App shell and navigation
6. Screens
7. Components
8. Debt by bank and type
9. Data honesty in the UI
10. Icons
11. Responsive behaviour
12. Thai and English
13. Accessibility
14. Pending decisions

---

## 1. Principles

1. **Palladian, blue, flame, truffle.** Six colours from one palette and nothing else. Palladian is the page, Blue Fantastic carries the nav and secondary cards, Abyssal carries the text.
2. **Two weights.** Regular (400) for text, bold (700) for titles, numbers, buttons and active states. Bold is a faux bold of LINE Seed Sans TH Regular until a real bold file is self hosted.
3. **Rounded, joined, quiet.** Rounded cards, joined card blocks with 1px dividers, no shadows, no gradients, no outlines.
4. **Colour means state.** Flame is for the main action and highlights. Truffle means attention (due soon, shortfall, needs review). Blue means progress and good standing. Colour is never decoration and never the only signal.
5. **Every number has a source.** The UI shows where a figure came from and how sure we are (see section 9).
6. **Phone first.** Design at 390px wide, then widen. One thumb, one task per screen.
7. **Plain words.** Short sentences, no jargon, no pressure. No em dash, no all caps, no exclamation marks.
8. **Local first.** Fonts and icons are self hosted. No third party requests from the UI.

---

## 2. Palette and tokens

Brand palette (given):

| Name | Value | Role |
|---|---|---|
| Palladian | `#EEE9DF` | Page background |
| Oatmeal | `#C9C1B1` | Pressed and hover fills, dividers, quiet chart fills |
| Blue Fantastic | `#2C3B4D` | Bottom nav, left rail, secondary and feature cards |
| Abyssal Anchorfish Blue | `#1B2632` | Text on light surfaces, darkest fills |
| Burning Flame | `#FFB162` | Primary button fill, active nav item, highlight icons on blue |
| Truffle Trouble | `#A35139` | Attention state, icons on light surfaces, destructive button |

Tokens (CSS custom properties on `:root`):

| Token | Value | Use |
|---|---|---|
| `--bg` | `#EEE9DF` | Page background |
| `--surface` | `#DDD7CA` | Cards on the page (Palladian mixed with 45% Oatmeal) |
| `--surface-2` | `#C9C1B1` | Hover and pressed fill of a card or row |
| `--card-dark` | `#2C3B4D` | Nav bar, rail, secondary and feature cards |
| `--card-dark-2` | `#3D4B5B` | Hover and pressed fill on dark cards (Blue mixed with 8% white) |
| `--text` | `#1B2632` | Text and icons on light surfaces |
| `--muted` | `rgba(27,38,50,.72)` | Secondary text on light surfaces |
| `--line` | `rgba(27,38,50,.16)` | Hairlines and joined card dividers on light surfaces |
| `--on-dark` | `#EEE9DF` | Text and icons on Blue Fantastic and Abyssal |
| `--on-dark-muted` | `rgba(238,233,223,.72)` | Secondary text on dark cards |
| `--line-dark` | `rgba(238,233,223,.16)` | Hairlines on dark cards |
| `--accent` | `#FFB162` | Primary button fill, active nav item, highlight icons on dark |
| `--red` | `#BF3520` | Primary button, active chip, red cards, attention. Text capable: 4.6:1 with Palladian text, 4.6:1 as text on Palladian |
| `--red-bright` | `#E8472B` | Dots, step dots, tab indicator, decorative accents. Not for text |
| `--red-soft` | `rgba(232,71,43,.14)` | Icon tile background on light surfaces |
| `--warn` | `#BF3520` | Alias of `--red` for attention states |
| `--good` | `#2C3B4D` | Progress fill and good standing |
| `--chart-5` | `#7D7769` | Sixth chart colour (Oatmeal mixed with 40% Abyssal) |

Only mix palette colours with each other or with white. Do not add new hues. Light theme only for now. `theme-color` and the PWA background are `#EEE9DF`.

### Text contrast (computed)

| Text on background | Ratio | Rule |
|---|---|---|
| Abyssal on Palladian | 12.7:1 | Any size |
| Abyssal on Surface | 10.7:1 | Any size |
| Abyssal on Oatmeal | 8.6:1 | Any size |
| Palladian on Blue Fantastic | 9.4:1 | Any size, all text on dark cards and the nav |
| Flame on Blue Fantastic | 6.4:1 | Active nav item, highlight icons and numerals on dark cards |
| Abyssal on Burning Flame | 8.6:1 | Primary button text |
| Palladian on Truffle | 4.6:1 | Destructive button text at 16px and up |
| Truffle on Palladian | 4.6:1 | Attention text at 16px and up, icons at any size |
| Truffle on Surface | 3.9:1 | Icons and text at 24px and up only |
| Truffle on Blue Fantastic | 2.1:1 | Never |
| Flame on Palladian or Surface | 1.5:1 | Never as text or icon. Flame is a fill on light surfaces |

Rules that follow: no pure white text anywhere. Abyssal is the text colour on light surfaces and Palladian is the text colour on dark ones. Flame appears as a fill on light surfaces and as text or icons only on dark ones. Truffle appears as icons and fills on light surfaces, and as text only at 16px and up on Palladian.

---

## 3. Typography

- **Family.** LINE Seed Sans TH, regular only, for Thai and Latin. Self hosted `woff2`, `font-display: swap`, preloaded. Fallback: `'Inter', 'IBM Plex Sans Thai', system-ui, sans-serif`.
- **Two weights.** `font-weight: 700` on `.h1`, `.h2`, `.display`, buttons, row values and chips that are on. Everything else is 400.
- **Numbers.** Use tabular figures for money so columns line up.

| Role | Phone | Wide screen |
|---|---|---|
| Display number (total debt, tax due) | 40px | 56px |
| Title (screen heading) | 24px | 32px |
| Section heading | 18px | 20px |
| Body | 16px | 16px |
| Label, caption | 14px | 14px |
| Minimum size | 12px, only for timestamps | |

Line height `1.5` for Latin, `1.7` for Thai so tone marks do not collide.

Money format: `฿ 1,234,567`, no decimals unless below 100. Dates: Buddhist era in Thai (for example `15 ต.ค. 2569`), Gregorian in English. Store dates as ISO Gregorian.

---

## 4. Shape, spacing and motion

| Token | Value | Use |
|---|---|---|
| `--radius` | `14px` | Buttons, inputs, chips |
| `--radius-lg` | `22px` | Cards, joined blocks, sheets |
| (fixed) | `999px` | Progress bars, toggle, avatar |

- Spacing steps: 4, 8, 12, 16, 24, 32, 48. Phone gutter 20px. Card padding 20px (24px on wide screens).
- Joined cards use 1px `--line` dividers inside one rounded block, clipped to the radius.
- Motion: `.16s cubic-bezier(.4,0,.2,1)` for colour changes, `.24s` for sheet and page transitions. Reduced motion turns movement off and keeps colour changes.
- No shadows. Press state: fill moves to `--surface-2`.

---

## 5. App shell and navigation

### Phone (under 900px)

- **Top bar** (56px): app name `Debtwise` on the left, the avatar on the right. The avatar opens Profile.
- **Content:** scrolls between the bars, 20px gutters.
- **Bottom nav** (64px plus the device safe area): four tabs, icon above label.

| Tab | Icon | Content |
|---|---|---|
| Home | `--text` `#1B2632` |
| Invest | chart | Tokenomist token data |
| Tax | doc | Income, tax due, ways to reduce it |
| Debt | wallet | Debt by bank and type |

- Bottom nav fill is Blue Fantastic. Active tab: Flame icon and label, plus a 3px Flame bar above the icon. Inactive: `--on-dark-muted`.
- Tap targets at least 44 by 44px.
- The consultant is Home, the first tab. There is no separate Talk screen. Invest and Tax are add-ons on top of the debt core.

### Tablet and desktop (900px and up)

- The bottom nav becomes a left rail (88px, labels under icons) with the same four tabs. At 1200px and up it widens to 220px with icon and label side by side.
- Content is centred in a 1120px column. At 1200px and up, Home and Debt use two columns.
- The avatar moves to the top right of the content area.

### Sign in and onboarding

1. **Sign in.** One screen: logo, one line, `Continue with Google`, and an email option. Auth by Supabase (Google OAuth, email as the alternative).
2. **Onboarding (first sign in only, cannot be skipped).** A stepper with progress dots. One question group per screen. A back button on every step.

| Step | Fields |
|---|---|
| 1 About you | Name, birth year, household (people who depend on your income) |
| 2 Income | Income type (salary, freelance, both), monthly income, other income, pay day |
| 3 Work horizon | Retirement age or year. Optional: expected income after retirement |
| 4 Essentials | Monthly essential spending (rent, food, school fees). Optional, asked once |
| 5 Debts | Add now (upload, talk, form) or later |

Required: birth year, monthly income, retirement age or year. Everything else can be marked `later`. If essentials are missing, the plan screen shows a notice and asks for them, because the plan cannot protect essential spending without them.
Every field can be edited later in Profile.

### Profile

Opened from the avatar. Sections: personal info, income, work horizon, essentials, language (TH / EN), data (backup, export, delete), about, sign out. Uses the same field components as onboarding. Saving shows a short confirmation. Changing income or essentials updates the plan, tax estimate and Home.

---

## 6. Screens

### Home (the consultant)

- **Summary card** (dark, `--card-dark`): this month's figure in Flame (what is left, or `Short by` with the amount), the next due payment with days left, and three buttons: the plan, add a debt, add due dates to calendar.
- **Conversation** below the card: assistant messages are `--surface` bubbles with an `AI` label, the person's messages are dark bubbles. The first message is generated from the engine numbers (empty state, debts added, new month, short or covered).
- **Composer** docked above the nav: text input, mic button, send button. Voice replies play only after a spoken message.
- Proposed changes from the consultant appear as a card with the value and an `Apply` button. Nothing changes until it is pressed.
- Figures in a reply that cannot be matched to the engine are flagged with a warning line under the message.

### Invest

- Header: `Token events` with the data timestamp.
- **Watchlist:** tokens the user follows.
- **Upcoming unlocks:** rows with token, date, amount and share of supply.
- **Vesting and emissions:** simple table per token.
- **Context line:** how much is left after essentials, debt and tax, as an information line. No buy or sell wording.
- Every block shows source (Tokenomist) and the data timestamp. Footer line: `Information only, not advice`.
- **Pending checks:** Tokenomist API access, supported assets and commercial terms are not verified. Show sample data labelled `sample` until confirmed.

### Tax

- Header: tax year and income so far.
- **Estimate card:** annual income, estimated tax payable (large number), assumptions listed under it, missing information listed in Truffle.
- **Ways to reduce it:** a checklist of deductions and allowances the user may qualify for, each with the estimated amount it could save, what paperwork to keep, and the rule it comes from. Wording: `You may be able to` and `Check with`, never `You should`.
- **Deadline:** next filing or payment date.
- Tax uses official rules for the stated year. If a rule is not loaded, show `Not available yet` rather than a guess. **Pending:** which tax situations come first.

### Debt

- Header: total owed (display number) and the monthly total of payments.
- **View switch:** `By bank` (default) and `By type`.
- **By bank:** one card per lender. Each card shows the bank name, the total owed to that bank, and a stacked bar split by debt type with the amounts listed under it. Informal debts group under `Personal and informal`.
- **By type:** one card per type (credit card, personal and nano loan, car, home, student loan, informal) with the total and the banks inside it.
- Tap a bank or a type to open the list of loans. Tap a loan for the detail: balance, rate, minimum payment, due date, progress bar, source line and status badge.
- **Add a debt** (button): choose upload statement, talk, or form.
- **Review screen** (after upload): each extracted value beside the source line it came from, with a confidence mark. The user confirms or edits. No plan is built from unconfirmed values.

### Plan and refinance (inside Debt)

- **Plan:** this month's amount per debt and the reason, shortfall in Truffle when payments exceed what is available.
- **Refinance check:** compare a sample offer with the current loan. Show every input, fees, penalty, term, and the net saving or loss. Label offers `sample` with a source link and date.

---

## 7. Components

| Component | Spec |
|---|---|
| Button, primary | Burning Flame fill, Abyssal text at 16px or larger (8.6:1), `--radius`, 52px high, full width on phones. One per screen. Hover and press: Flame mixed with about 12% Abyssal. |
| Button, secondary | `--surface` fill, Abyssal text, hover `--surface-2`. On dark cards: `--card-dark-2` fill, Palladian text |
| Button, text | Abyssal text, underline on hover and focus |
| Card | `--surface`, `--radius-lg`, 20px padding, Abyssal text. Feature or secondary cards use `--card-dark` with Palladian text |
| Joined block | Several cells in one rounded block, 1px `--line` dividers (`--line-dark` on dark cards) |
| Stat tile | Label (muted, 14px), value (display size), optional delta line. The headline tile on Home and Debt uses `--card-dark` with the value in Flame |
| Row | 56px high, icon or avatar, title, subtitle, value on the right, hairline below |
| Chip | `--surface`, 999px, 32px high, 14px text. Selected: Blue Fantastic fill with Palladian text (no outlines) |
| Input | `--surface`, `--radius`, 52px high, label above in muted, error text in Truffle at 16px with an icon |
| Stepper | Dots at the top, current dot Abyssal, past dots Blue Fantastic, future dots `--line` |
| Progress bar | 8px, track `--surface-2`, fill Blue Fantastic. Shortfall fills Truffle |
| Stacked bar | 12px, segments in the type colours (section 8), amounts listed beneath |
| Bottom sheet | Slides up on phones, `--bg` fill, `--radius-lg` top corners, 4px handle. A centred dialog on wide screens |
| Toast | `--card-dark` with Palladian text, 3 seconds, bottom, above the nav |
| Badge | A small dot plus a word (see section 9) |

Hover and focus: fills move to `--surface-2`. Keyboard focus also underlines text links. Never remove the state change.

---

## 8. Debt by bank and type

Type colours for bars and chips (colour is paired with a text label and an amount, never alone):

| Type | Colour |
|---|---|
| Credit card | `--warn` `#A35139` |
| Personal and nano loan | `--accent` `#FFB162` |
| Car or motorbike | `--card-dark` `#2C3B4D` |
| Home | `--text` `#1B2632` |
| Student loan and informal | `--chart-5` `#7D7769` |

- Bank card example: `Bank name`, `฿ 480,000`, then a stacked bar and four lines such as `Credit card ฿ 60,000`.
- Sort banks by total owed, largest first. Show the share of total as a muted percentage.
- If a debt is only user stated, its row carries the `user stated` badge and is not counted as verified in the summary line.
- Truffle for a type only means credit card in this view. Do not reuse Truffle for other meanings on the same screen. Warnings on this screen use an icon and a text label.

---

## 9. Data honesty in the UI

- **Source line.** Every figure can open to show its source: file name and page or row, or `You said`, or `Sample data`.
- **Badges.**

| Badge | Meaning | Look |
|---|---|---|
| Verified | Value matched a source and the user confirmed it | Blue dot (filled) and the word |
| Needs review | Low confidence extraction or a conflict | Truffle dot and the word |
| User stated | Typed or spoken, no document | Hollow dot and the word |
| Sample | Demo or example data | Hollow dot and the word `sample` |

- **Estimates** are labelled `estimate` with the assumptions one tap away.
- **Simulated** payments, bank connections and lender approvals are labelled `demo`.
- **Wording.** Say what the numbers show and what the options are. Never `safe`, never `you should`, never a promise of saving.
- **Consultant.** AI messages are marked as AI. A figure inside a message links to its source.
- **Data location.** Profile shows where data is kept and offers backup and delete. **Pending:** storage is not decided, so the UI says only what is true when built.

---

## 10. Icons

- Inline SVG sprite, `viewBox="0 0 64 64"`, `fill="none"`, `stroke="currentColor"`, `stroke-width: 2.6`, round caps and joins. Colour comes from the text colour.
- Sizes: nav 28px, rows 24px, tiles 40 to 64px.
- Starting set: home, chart, doc, wallet, person, bell, camera, mic, upload, edit, check, warn, lock, globe, chat, calendar, bank, card, car, house, book.
- Not filled except small dots. Every icon is `aria-hidden`, and icon-only controls have an `aria-label`.

---

## 11. Responsive behaviour

Design at 390px first. Then check 360, 768, 1024, 1440.

| Width | What changes |
|---|---|
| under 600px | Single column, bottom nav, 20px gutters, sheets from the bottom |
| 600 to 899px | Single column up to 640px wide, centred, bottom nav |
| 900 to 1199px | Left rail nav (88px), content up to 1120px |
| 1200px and up | Wide rail (220px), two columns on Home and Debt, sheets as dialogs |

- No sideways scroll anywhere. Tables become stacked rows on phones.
- Use `min-width: 0` on flex and grid children that hold text.
- Respect device safe areas (`env(safe-area-inset-*)`) for the bottom nav and top bar.
- PWA: `display: standalone`, theme colour `#EEE9DF`, icons 192 and 512, works offline for saved data.

---

## 12. Thai and English

- Thai is the default. A toggle in Profile (and on the sign-in screen) switches the whole app.
- All text lives in a dictionary file per language. No text is hard coded in components.
- Product and bank names stay as they are written.
- Thai uses the same font and weight, a taller line height, Buddhist era dates and Thai number grouping in the same `1,234` style.
- Any new string needs both languages before it ships.

---

## 13. Accessibility

- Text colours follow the contrast table in section 2. Muted text stays at 72% opacity or higher. No pure white text.
- No information by colour alone: every colour-coded item also has a word, icon or amount.
- Tap targets at least 44px. Focus is visible through the state change and underline.
- Screen readers: icon-only controls have labels, charts have a text summary, the stepper announces `step 2 of 5`.
- Large text: layouts hold at 200% browser text size without sideways scroll.
- Reduced motion respected. Voice input always has a text alternative.
- Forms: labels above fields, errors in words and an icon, not colour only.

---

## 14. Pending decisions

Decided:

- **Primary button:** Burning Flame fill, Abyssal text. Palette changed to Palladian, Blue Fantastic, Flame, Truffle (light theme).
- **Work horizon:** retirement age or year.
- **Essentials step:** optional.
- **Heart of the app:** the consultant on Home. Return hook is due dates and a monthly plan refresh. Invest and Tax are add-ons.
- **Invest and Tax in the first build:** full layout and flows with sample data, every block labelled `sample`, until Tokenomist access and official tax rules are verified.

Still open:

1. **Push reminders for due dates.** Not built. A calendar file export covers it for now.
2. **Invest and Tax checks before real data:** Tokenomist API access and terms, official tax rules for the year, and wording that avoids personal advice.
3. **Storage.** Local, Supabase, or both. The code uses one storage interface so either can plug in. The UI makes no storage claim until decided.
4. **Light theme.** None for now.
5. **Name and logo.** `Debtwise` text only until a logo exists.

---

## 15. Tamroi alignment (current, overrides earlier sizes and layout)

Reference: `Tamroi-purple/` (read only). Debtwise takes its design principles, sizing, type scale and layout. Colours stay the Debtwise palette. The font stays LINE Seed Sans TH. Nothing is copied: no code, no Bootstrap, no external fonts.

**Frame and layout**
- A fixed 430px column, centred on every screen width. On screens wider than 768px the page surround is Abyssal with a soft shadow and a hairline either side of the frame. The earlier side rail and two column layouts are removed.
- Three zones in a flex column: top bar (56px), a scrolling content area (16px padding), bottom nav (60px plus the device safe area). The content scrolls, the bars do not.
- Top bar: avatar and name on the left (opens Profile), page title centred (Kanit-style heading weight, 16px), language toggle and settings icon on the right. Hairline underneath.
- Bottom nav: Blue Fantastic, hairline on top, 10px labels, icon above. The active tab is Flame with a 24px by 3px red indicator hanging from the top edge.

**Tokens (same scale as the reference)**
- Type: 10, 12, 14, 16, 18, 22, 28, 36px. Body 14px. Titles 22px bold, section heads 16px bold, hero figures 28px bold.
- Spacing: 4, 8, 16, 24, 32px.
- Radius: 8, 12, 16, 20, 24px and full. Cards 16px, buttons and inputs 12px, bottom sheet 24px on top.
- Shadows are back: cards use `0 4px 20px` in tinted Abyssal, the primary button has a red glow, the sheet has an upward shadow.
- Motion: 150ms for colour, 250ms for overlay fade, 350ms for the sheet rise.

**Components**
- Buttons: 14px by 24px padding, 12px radius, bold, press scales to 0.97. Primary is red with glow. Secondary is Blue Fantastic. Outline, ghost and danger (tinted red with a red border) follow the reference. Small buttons are 8px by 16px.
- Inputs: tinted fill, 1.5px border, 48px high, a red icon on the left, a unit on the right, border turns red on focus. Labels sit above in muted 12px.
- Pills: outlined, muted text, selected pill is filled red with Palladian bold text.
- Cards: shadowed, 16px padding. Variants: surface (default), dark (Blue Fantastic), red, outlined.
- Stats row: three equal tiles with a bold value and a 10px muted label. Used on Home for income, essentials and debt payments.
- Icon tile: a 38px circle with a soft red fill and a red icon (reference uses a primary-dim circle).
- Step indicator: numbered 28px dots joined by short lines, the current step red, finished steps Blue Fantastic with a check.
- Bottom sheet: 36px by 4px handle, 24px top radius, fades the overlay in and rises. Day and year pickers use it.

**Colour roles (unchanged palette)**
- Page Palladian, paper cards Surface, dark panels Blue Fantastic, text Abyssal, highlight Flame, action and attention red `#BF3520`, bright red `#E8472B` for dots and indicators.
- Red text only on Palladian. Never red on dark cards, use Flame there.

**Not taken from the reference:** Inter and Kanit fonts, Bootstrap, the dark ink page background, map and game components.

---

## 16. Icons and sign in (current)

- **Icons are Bootstrap Icons**, installed from npm (`bootstrap-icons`) and bundled by Vite, so there is no CDN request. `Icon.tsx` maps the app's own names (home, wallet, card, car, coins, and so on) to `bi-*` classes. This replaces the hand drawn 64 unit SVG paths in section 10.
- **Language switcher** is a 44px circle at the top right of the page frame on sign in and onboarding (globe icon over `EN` or `TH`). Inside the app it is a round icon button in the top bar.
- **Sign in uses compact controls**: the Google button, the email input and the send button are all 40px high with 10px radius and 12px text, so they read as one set. The `compact` class on the page frame applies this. Other screens keep the 48px controls from section 15.
