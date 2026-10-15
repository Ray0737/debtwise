# Taskmaster website: design system

This file documents the look, the building blocks and the rules of the Taskmaster website, so a new page or a new contributor can match it without guessing. It describes what the site does today. Where an older rule in `assets/css/style.css` has been overridden by a later one, this file lists the value that wins.

Contents

1. [Principles](#1-principles)
2. [Folder and files](#2-folder-and-files)
3. [Tokens](#3-tokens)
4. [Typography](#4-typography)
5. [Layout](#5-layout)
6. [Components](#6-components)
7. [Icons](#7-icons)
8. [Diagrams](#8-diagrams)
9. [Imagery](#9-imagery)
10. [Interaction and motion](#10-interaction-and-motion)
11. [Responsive behaviour](#11-responsive-behaviour)
12. [Thai and English](#12-thai-and-english)
13. [Accessibility](#13-accessibility)
14. [Writing rules](#14-writing-rules)
15. [How to add things](#15-how-to-add-things)
16. [Performance](#16-performance)
17. [Known leftovers](#17-known-leftovers)

---

## 1. Principles

The style is black and white, quiet and confident. Ten rules carry most of it.

1. **Two colours and three greys.** Pure black and white, plus light greys for surfaces and mid greys for secondary text. The only colour on the whole site is orange inside the Git logo in the architecture diagram.
2. **One weight.** Every piece of text is regular weight (400). Hierarchy comes from size and colour, never from bold.
3. **No capitals for style.** No all caps, no small caps, no `text-transform`.
4. **No em dash.** Use a comma, a colon, a full stop or a new sentence. This applies to every piece of text on the site, English and Thai.
5. **No shadows, no outlines, no bubbles on hover.** Hover changes the colour of text, underlines it, or shifts a solid fill to a slightly different solid. Joined cards turn pitch black.
6. **Rounded, never sharp.** Cards, buttons, tiles and code boxes all have rounded corners. Full width bands (banner, footer) are square.
7. **Key message only in banners.** The home banner says what the product is and offers one button. The other page banners carry a one word title and one short line.
8. **Icons, not decoration.** Line icons on a 64 unit grid carry meaning. There are no illustrations, gradients or stock photos, apart from the real app screenshot on the home page.
9. **Calm spacing.** Large, even gaps. Sections breathe, cards are padded generously.
10. **Local first.** The site loads no scripts, fonts or images from other sites. The font is self hosted.

---

## 2. Folder and files

```
Website - Taskmaster/
  index.html        home
  doc.html          documentation
  download.html     download
  setup.html        setup guide (agents, models, install commands, skills, projects)
  support.html      support hub, beta status, what is new
  community.html    community page (no nav, no footer, icon dock)
  terms.html        terms of use
  privacy.html      privacy policy
  DESIGN.md         this file
  assets/
    css/style.css       the only stylesheet
    js/main.js          mobile menu and documentation contents highlight
    js/i18n.js          English and Thai toggle engine
    js/th.js            the Thai dictionary (English text to Thai text)
    fonts/lineseedsansth_rg.woff2   LINE Seed Sans TH, regular weight
    img/hero.webp, hero-800.webp    home screenshot, 1600 and 800 wide
    img/banner.webp                 photo for the community page background
    img/logo.svg, logo-white.svg, logo-mark.svg
```

Notes:

- The pages are plain static HTML. There is no framework and no build step in this folder.
- The HTML files were produced by a generator that is not part of this folder. If you edit a page by hand, keep the structure described below. If the generator is run again it will overwrite hand edits.
- Every page loads `style.css` in the head and `main.js` and `i18n.js` (deferred) at the end of the body. The community page loads only `i18n.js`.
- Icons are an inline SVG sprite at the top of each body, used with `<svg class="icon"><use href="#i-name"/></svg>`.

---

## 3. Tokens

All tokens are CSS custom properties on `:root`. The file starts with the comment `/* ===== Engineers - design tokens ===== */`.

### Colour

| Token | Value | Use |
|---|---|---|
| `--bg` | `#ffffff` | Page background, card background on grey sections |
| `--surface` | `#f4f4f4` | Cards, code boxes, tiles, call to action band, contents chips |
| `--surface-2` | `#e9e9e9` | Inline code on grey, hover fill of light buttons |
| `--text` | `#000000` | Main text, solid buttons, black bands |
| `--muted` | `#5c5c5c` | Secondary text, descriptions, table headings, breadcrumb links |
| `--ink-2` | `#2b2b2b` | Hover colour of solid black buttons |
| `--line` | `rgba(0,0,0,.13)` | Hairlines: table rows, section rules, breadcrumb bar |
| `--line-strong` | `rgba(0,0,0,.35)` | Dividers between joined cards, link underlines |

Colours used directly in a few places:

- `#000` and `#fff` for black bands and white text on them.
- White text steps on black: `rgba(255,255,255,.72)` for body text, `.6` for labels, `.5` to `.68` for footer links, `.16` for footer rules.
- Git orange `#F05032`, only inside the architecture diagram.

### Shape

| Token | Value | Use |
|---|---|---|
| `--radius` | `14px` | Buttons, code boxes, notes |
| `--radius-lg` | `22px` | Cards, joined card blocks, the download panels, figures |
| (fixed) | `12px` | Compact buttons and the nav Download button |
| (fixed) | `14px` / `20px` | Icon tiles (48px) / the download badge (72px) |
| (fixed) | `999px` | Contents chips on phones |

### Motion

| Token | Value |
|---|---|
| `--ease` | `cubic-bezier(.4,0,.2,1)` |
| `--dur` | `.16s` |

### Fonts

| Token | Value |
|---|---|
| `--font` | `'line_seed_sans_th', 'Inter', 'IBM Plex Sans Thai', system-ui, sans-serif` |
| `--mono` | `ui-monospace, 'Cascadia Mono', 'JetBrains Mono', Consolas, monospace` |

### Spacing

There is no spacing scale token. The values in use are:

| Where | Value |
|---|---|
| Section padding | `104px` top and bottom, `72px` for `.tight`, `72px` under 900px, `56px` under 700px |
| Grid gap | `20px` for loose grids, `1px` for joined cards |
| Card padding | `32px` (plain), `48px 32px` (joined), `32px` (hub) |
| Page gutter | `28px` on the 1120 container, `40px` on the 1400 container, `20px` on phones |

---

## 4. Typography

**Family.** LINE Seed Sans TH, regular weight only, for Latin and Thai text. It is self hosted from `assets/fonts/lineseedsansth_rg.woff2` with `font-display: swap` and is preloaded in the head. The original design import line was `@import url('https://bit.ly/3CZa0Sz');`, which resolves to the same font files on a CDN. The site uses a local `@font-face` instead so the page does not wait on two redirects.

**One weight.** `* { font-weight: 400; font-synthesis: none; text-transform: none; }`. `b`, `strong`, `th`, `dt` and `summary` are also forced to 400. Do not add bold, and do not let the browser fake it.

**Scale.** Sizes are fluid for headings and fixed for text.

| Element | Size | Notes |
|---|---|---|
| `h1` | `clamp(2.6rem, 6.4vw, 4.8rem)`, line height 1.04, letter spacing `-.025em` | Home banner |
| Page banner `h1` | `clamp(2.6rem, 6vw, 4.6rem)` | White on black |
| `h2` | `clamp(1.8rem, 3.4vw, 2.5rem)` | Section titles |
| `.prose h2` | `2.1rem` (`1.7rem` on phones) | Documentation sections |
| `h3` | `1.45rem` | Card titles `1.3rem`, hub titles `1.45rem` |
| `h4` | `1.15rem` | |
| Body | `16px`, line height `1.7` | Thai body line height `1.75` |
| Lead | `1.2rem`, `--muted` | |
| Section intro | `1.1rem`, `--muted` | |
| Table | `.97rem`, headings `.9rem` | |
| Small | `.875rem` | Captions, notes under commands |
| Code | `.88em` inline, `.9rem` in blocks | Mono |

Headings use `text-wrap: balance` and `letter-spacing: -.01em`. Thai headings get a line height of `1.35` so tone marks do not collide.

**Measure.** Prose paragraphs and lists are capped at `72ch`. Section intros at `640px`. The description under a page banner at `52ch`.

---

## 5. Layout

### Containers

| Class | Max width | Gutter | Used by |
|---|---|---|---|
| `.wrap` | 1120px | 28px (20px on phones) | Page content: sections, cards, download, support |
| nav `.wrap`, banner `.wrap`, crumb bar `.wrap`, footer `.wrap` | 1400px | 40px (20px on phones) | Everything that spans the page edge to edge |
| `.doc-wrap` | 1120px, 1400px from 1380px up | as `.wrap` | Documentation and legal pages |

The logo, the banner title, the breadcrumb and the footer brand all start at the same left edge (the 1400 container). The nav Download button, the banner icon and the footer's last column end at the same right edge.

### Page skeleton

Every inner page is built the same way:

1. Sticky **nav** (68px high).
2. Full width black **banner** with the title, one line, and a large white icon on the right.
3. **Breadcrumb bar** (56px) with a hairline under it: `Home > Page`.
4. Content in `.wrap` blocks or `.section` bands.
5. Black **footer**.

The home page has no banner. It starts with the centred hero (logo mark, headline, one button, screenshot).

### Documentation layout

`.doc-layout` is a single column up to 1379px, with the contents list above the text in a grey rounded box. From 1380px up it becomes two columns: a 230px sticky contents list on the left and a 1000px text column. On phones the contents list becomes a single row of chips that scrolls sideways.

### Breakpoints

| Width | What changes |
|---|---|
| 1380px and up | Documentation gets the sticky side contents |
| 1000px and below | Hub cards go 2 by 2, banner icon shrinks |
| 960px and below | Nav becomes a logo plus a menu button with a drop down panel |
| 900px and below | Three column grids and the download split become one column. Footer goes to 3 columns. Banner and contents tighten |
| 700px and below | Tighter section padding, diagrams scroll sideways, banner icon hidden, footer stacks, code wraps |
| 560px and below | Single column hubs, 20px gutters, footer 2 columns |
| 400px and below | Smaller home headline |

---

## 6. Components

### 6.1 Navigation

- Sticky, `rgba(255,255,255,.94)` with a 10px backdrop blur, no border, no shadow.
- Left: the brand, a 30px logo tile and the word Taskmaster at `1.2rem`.
- Right: links with a small line icon and a label, then a language toggle, then the **Download** button. The gap between each pair is `28px`, including the gap to the Download button.
- Links are `--muted`, turn `--text` on hover. The current page is `--text` with a 1.5px underline 9px below the text.
- The Download button is a black rounded rectangle (12px radius, `9px 20px` padding) with the Windows icon. Hover shifts it to `--ink-2`.
- Links shown: Home, Support, Terms, Privacy. Documentation, Setup guide and Community are reached from the footer and from page content.
- **Language toggle:** an `a` with a globe icon and `TH` (it shows `EN` once Thai is on). It is marked `data-lang-toggle` and `data-noi18n`.
- **Phones (960px and below):** the links collapse behind a 44px menu button (three lines, becomes a cross). The panel drops under the bar, full width, with each link as a 15px padded row with a hairline, and a full width black Download button at the bottom. It closes when a link is tapped, on Escape, and when the window grows past 960px. The state class is `.is-open` on `.nav`.
- **Community page:** no nav at all.

### 6.2 Buttons

One solid style, compact.

| Part | Value |
|---|---|
| Padding | `11px 22px` (`11px 20px` on phones) |
| Font size | `1rem` |
| Radius | `12px` |
| Gap | `10px` between icon and text |
| Icon | `1.2em` |
| Fill | `--text`, text `--bg` |
| Hover and keyboard focus | fill becomes `--ink-2` |

Variants: `.btn-light` (white fill on dark bands, hover `--surface-2`) and `.btn-soft` (grey, currently unused). Every download button has the Windows icon.

### 6.3 Links

- Links inside prose are underlined with a faint line (`--line-strong`, 1px, 4px offset). On hover the text turns `--muted`.
- Navigation and card links are not underlined. They change colour, or underline on hover.
- Keyboard focus on any link underlines it (1.5px, 6px offset). There is no outline ring.
- On black, links are white and dim to 70% on hover (`.link-light`).

### 6.4 Page banner

A full width black band.

- Title: white, regular, banner size (see typography).
- Under it: one line in `rgba(255,255,255,.7)` at `1.15rem`.
- Right: one line icon at 150px (96px under 1000px, hidden under 700px), white, no frame, no circle, no tile.
- Minimum height `290px` (`240px` under 1000px, `200px` to `210px` on phones).
- Icons by page: Documentation = book, Download = Windows, Support = chat bubble, Setup = terminal, Terms = document, Privacy = shield.

### 6.5 Breadcrumb bar

A white bar, 56px high, with a hairline under it. `Home` is a muted link with an underline, then `>`, then the current page in black. `1rem`.

### 6.6 Hero (home)

Centred. A 76px logo mark, the headline (`max-width: 14ch`), one black button, then the app screenshot inside a `--surface` rounded frame with 14px padding. The screenshot is `hero.webp` (1600 by 1000) with an 800px version for phones, preloaded, with `fetchpriority="high"`.

### 6.7 Cards

| Class | Look | Where |
|---|---|---|
| `.card` | `--surface` fill, 22px radius, 32px padding, 40px icon, title, grey text | Base |
| `.grid.joined` with `.card` | One rounded block, 1px dividers (`--line-strong`) between cells, no gaps | Home features, download needs and steps |
| `.hub` | Left aligned card with a 44px icon, title, text and `See more >` pinned to the bottom, min height 340px | Support page |

**Joined cards** are the signature element. All cells are centred, with a 64px icon at the top. On hover or keyboard focus a cell turns pitch black, its text turns white, its grey text turns `rgba(255,255,255,.72)`, its icon grows 10%, and any inline `code` becomes a faint white box. Transition `.16s`. The block is clipped to the 22px radius so only the outer corners are round.

**Hub cards** do the same hover: black fill, white text.

### 6.8 Icon tiles

A `.tile` is a 48px rounded square (14px radius) in `--bg` holding a 24px icon. `.tile.big` is 64px, `--surface`, with a 32px icon. They sit beside section headings, in list rows and in step cards. On a grey section the big tile switches to `--bg`.

### 6.9 Section headings with an icon

A section head that starts with a `.tile.big` puts the tile on the left and the title on the right, vertically centred. If a line of text follows, it sits under the title next to the tile.

### 6.10 Download panel

Two blocks side by side (1.1fr and 1fr, 20px gap):

- **Left, black:** a 72px white badge with the Windows icon, a small label (`Latest version 1.1.0, beta`), the title, one line of text, and the compact white download button next to the file name.
- **Right, `--surface`:** a definition list of icon, label and value rows: Version, Platform, File size, Code signing, SHA-256. The hash is mono, `.78rem`, broken anywhere. Rows are separated by hairlines.

Under it: **Install in four steps** and **What you need**, both as joined card blocks (4 and 3 columns). Each step card has an icon, a `Step N` label in grey, a title and a line of text.

### 6.11 Lists with icons ("What is new")

A two column list. Each row has a 48px tile, the text, and a hairline under it. Rows are centred vertically.

### 6.12 Documentation text (`.prose`)

- Sections are separated by a hairline with 56px of space around it.
- Tables: no outer border, no cell borders, only hairlines between rows. Headings are small and grey. The first column does not wrap on desktop. Tables scroll sideways inside `.table-wrap` on narrow screens.
- Code: inline `code` and `kbd` have a `--surface` background and 7px radius. Blocks (`pre`) are `--surface` with 14px radius, 20px by 24px padding, and scroll sideways on desktop and wrap on phones.
- Figures: a diagram inside `.figure`, a caption in `.875rem` grey under it.
- Notes: a grey rounded box with an icon on the left, capped at `72ch`.

### 6.13 Call to action band

A full width `--surface` band: a large centred title, one grey line, the black download button, then a strip of three facts (Free for Windows, No account, No telemetry) as a joined block of white cells with 1px dividers and a 22px radius.

### 6.14 Footer

Black, `72px` top padding. Five columns, spread across the 1400 container: the brand with a short description (300px), then Product, Documentation, Legal and Developer, with equal space between them. Headings are white. Links are `rgba(255,255,255,.68)` and turn white on hover. Link rows are 12px apart. Email and long links do not wrap on desktop. A hairline separates the bottom bar: copyright and version on the left, Terms and Privacy on the right. On phones the Developer column takes the full row.

### 6.15 Support hub

Four hub cards (documentation, setup guide, report an issue, join the community), then a beta section as four joined cards, then **What is new** as a list, then a black two part block for Discord (coming soon) and GitHub (open source) with a compact white button.

### 6.16 Community page

No nav, no footer. One full height section, currently plain white with black text (a photo background and a dark filter exist in the CSS and can be turned back on by deleting the last block marked "Community page, plain white for now"). A centred headline, then two centred columns split by a thin vertical line: Discord (coming soon) and GitHub (open source, with a compact button). At the bottom, a centred **dock**: six icon links (Home, Documentation, Support, Terms, Privacy, Download) and the language toggle, spaced 44px apart. On hover an icon rises 9px and grows 30% with a soft spring, and a small label pops up above it. Reduced motion turns the animation off.

---

## 7. Icons

- **Format:** inline SVG sprite, `viewBox="0 0 64 64"`, `fill="none"`, `stroke="currentColor"`, `stroke-width: 2.6`, round caps and joins. Colour comes from the parent text colour.
- **Usage:** `<svg class="icon" aria-hidden="true"><use href="#i-name"/></svg>`. The class `.icon` is `1.5em` square by default. Buttons use `1.2em`, nav links `1.15em`, cards 40 to 64px, banners 150px.
- **Never filled** except for the Windows logo and a few small dots.
- Current set: `folder`, `code`, `terminal`, `search`, `tasks`, `bell`, `spark`, `chip`, `skill`, `inbox`, `branch`, `key`, `pr`, `import`, `person`, `bubble`, `image`, `lock`, `shield`, `layers`, `mail`, `monitor`, `play`, `check`, `doc`, `clock`, `cloud`, `edit`, `eye`, `warn`, `sliders`, `users`, `refresh`, `windows`, `home`, `globe`, `menu`, `close`, `book`.
- New icons should match: 64 grid, 2.6 stroke, about 8 units of padding, simple shapes, no more than a handful of paths.

---

## 8. Diagrams

The documentation diagrams are inline SVG so the text uses the page font and stays sharp.

- Black and white. Boxes have a 2px black outline and an 18px radius on a white fill.
- Icons sit in 64px outlined tiles (16% radius) with a lower case label under them.
- Connectors are 2px black lines with open arrowheads. Between boxes they are straight, or rounded right angle elbows. Never diagonal. Dashed lines (`7 6`) mean optional or passive.
- Arrow labels are lower case, 14px or larger, set beside the line on a white mask, not on it.
- No titles inside the picture. The caption under it explains the picture.
- Git appears as a diamond in Git orange `#F05032` with a white mark and no text. It is the only colour.
- Everything is centred, with generous space between blocks.
- Minimum text size is 14 units. On phones the diagram has a minimum width of 760px and the figure scrolls sideways.
- Each diagram has a `<title>` and a `<desc>` for screen readers.

Diagrams on the site: architecture, window layout, task lifecycle, an agent turn, how team data syncs, agent proposals, the team data folders, and the code map.

---

## 9. Imagery

| File | Size | Use |
|---|---|---|
| `hero.webp` | 1600 by 1000 | Home screenshot of the real app |
| `hero-800.webp` | 800 by 500 | Same, for phones |
| `banner.webp` | photo | Community page background (not shown while the page is white) |
| `logo.svg` | | Black tile with a white mark. Nav and favicon |
| `logo-white.svg` | | White tile with a black mark, for black backgrounds |
| `logo-mark.svg` | | The mark alone, 76px on the home hero |

Photos are shown in black and white under a dark filter, so text on top of them stays readable. Convert photos to WebP at about 2400px wide before adding them.

---

## 10. Interaction and motion

**Hover rules** (nothing else is allowed):

| Element | Hover and keyboard focus |
|---|---|
| Nav link | Text turns black |
| Brand | Text turns grey |
| Prose link | Text turns grey |
| Contents link | Text turns black, underline appears |
| Breadcrumb link | Underline darkens, text turns black |
| Solid black button | Fill becomes `#2b2b2b` |
| White button | Fill becomes `#e9e9e9` |
| Joined card, hub card | Fill becomes black, text white |
| Footer link | Text turns white |
| Dock icon | Rises, grows, label pops up |

**Timing.** Colour changes use `.16s` with the `--ease` curve. The dock uses `.45s` with `cubic-bezier(.34,1.56,.64,1)` for a small spring. The joined card icon scale uses `.25s`.

**Focus.** Links underline. Buttons rely on the same fill change as hover. There are no focus rings, so never remove the hover or focus colour change from a control.

**Smooth scroll** is on, with `scroll-padding-top: 84px` so anchored sections clear the sticky nav.

**Reduced motion:** the dock animation is disabled.

---

## 11. Responsive behaviour

Design every addition at 1440px first, then check 390px, 360px and 320px. There must be no sideways scroll on any page. The only things allowed to scroll sideways are diagrams, tables and the documentation contents chips.

Rules that make this work:

- Every grid collapses to one column by 900px (hub cards 2 columns until 560px).
- Grid and flex children that hold text or code use `min-width: 0`, otherwise a long code line widens the page.
- On phones, inline code and code blocks wrap anywhere.
- Tap targets in the menu are at least 44px tall.
- The home screenshot swaps to the 800px file on phones.

---

## 12. Thai and English

The site is written in English. A toggle switches the whole page to Thai and back.

- **Engine:** `assets/js/i18n.js`. On click it loads `assets/js/th.js` (once), walks the page, and replaces text. Original text is kept so the page can switch back. The choice is stored in `localStorage` under `tm-lang`, and `<html lang>` follows it.
- **Dictionary:** `th.js` defines `window.TM_TH`, a map from the English text of an element to its Thai text. The key is the element's inner HTML with whitespace squeezed to single spaces. This means inline tags (`<code>`, `<kbd>`, `<a>`) are part of the key and must be repeated in the Thai value.
- **What is translated:** text inside elements, plus the attributes `aria-label`, `alt`, `data-label` and `title`, the page `<title>` and the meta description.
- **What is skipped:** `script`, `style`, `code`, `pre`, `kbd`, icons, and anything with `data-noi18n` (the toggle itself). Product and technical names (Taskmaster, Git, GitHub, Claude Code, file names, keyboard keys) stay in English on purpose.
- **Missing text:** if a string is not in the dictionary it simply stays English.
- **Toggle placement:** nav on every page with a nav. On the community page, the last icon in the dock.
- **Typography in Thai:** same font, same weight, taller line height (see typography). Never use bold or capitals.
- **Adding text:** any new English sentence needs a matching Thai entry, or Thai visitors will see English there. Keep the key identical to the final HTML.

---

## 13. Accessibility

- Contrast: black on white and white on black for text. Grey text is `#5c5c5c` on white (about 6.7:1). White at 60% on black is the lowest allowed for small labels.
- Every icon is `aria-hidden`. Icon only controls (menu button, dock links, language toggle) have an `aria-label`.
- The menu button has `aria-expanded` and `aria-controls`. The language toggle has `aria-pressed`.
- The current page link has `aria-current="page"`. Breadcrumbs sit in a `nav` with `aria-label="Breadcrumb"`.
- Diagrams have `role="img"` with a title and description.
- Keyboard: everything reachable by Tab, Escape closes the menu, hover effects also apply on focus.
- Images have `alt` text, or empty alt when decorative.
- The pages read fine without JavaScript, in English, on desktop. JavaScript adds the phone menu, the contents highlight and the Thai toggle.

---

## 14. Writing rules

- Plain, short sentences. Say what a thing does, then stop.
- No em dash. No all caps. No bold. No exclamation marks.
- Lower case labels in diagrams. Sentence case for headings and buttons.
- Say Windows 10 and 11, 64 bit. Say beta. Say not code signed. Do not oversell.
- Commands go in code blocks, one per line, with a short sentence before them. Say where to type them (PowerShell, or inside Claude Code for lines that start with a slash).
- Link to a project's own repository for anything installed from outside. Say that install commands change.
- Terms of use and the privacy policy are drafts. Facts in them (no telemetry, no accounts, token in memory only, app data in `%APPDATA%\taskmaster`) must stay true to the app.

---

## 15. How to add things

### A new page

1. Copy a similar page. Keep the head, the sprite, the nav, the banner with its icon, the breadcrumb bar, the content, the footer, and the two scripts.
2. Pick a banner icon from the sprite and write a one word title and one line.
3. Put content in `.wrap.first` for hub or card pages, or in `.doc-wrap` with `.doc-layout`, `.toc` and `.prose` for long text.
4. Add the page to the footer, and to the nav only if it is one of Home, Support, Terms or Privacy.
5. Add Thai text for every new string.
6. Check 1440px and 390px.

### A new card or list

Use `.grid.three.joined` (or `.four`, `.two`) with `.card` cells for feature lists. Use `.hubs` with `.hub` for links that lead somewhere. Do not create a new card style.

### A new button

Use `.btn`. Add `.btn-light` on black. Include an icon only when it adds meaning. Do not add sizes.

### A new colour

Do not. If a change needs emphasis, use size, a black band, or a black hover fill.

### A new icon

Add a `<symbol id="i-name" viewBox="0 0 64 64">` to the sprite in every page, matching the existing stroke style.

### Thai text for a new sentence

Add the English inner HTML as the key and the Thai text as the value in `assets/js/th.js`. Reload the page, switch to Thai, and check that the sentence changed.

---

## 16. Performance

- Total page weight is small: the stylesheet is about 38 KB, the Thai dictionary about 220 KB and only loads when Thai is chosen, the font is 32 KB.
- The home screenshot is WebP at 135 KB (45 KB on phones). Preload it and give it explicit width and height.
- No third party requests of any kind.
- `banner.webp` is only used on the community page and only when the photo background is on. Keep it near 100 KB. The file currently in the folder is larger, so shrink it before turning the photo back on.
- Add `width` and `height` to every image, to avoid layout jumps.

---

## 17. Known leftovers

`style.css` was built up in layers, and later rules override earlier ones. Several classes are no longer used by any page and can be deleted when convenient: `.banner-art`, `.btn-soft`, `.bullets`, `.contact`, `.crumb`, `.join` and its parts, `.link-light`, `.note-strip`, `.page-head`, `.pair`, `.photo-back`, `.rows`, `.soon` and its parts, `.split`, `.step`, `.steps-row`, `.tabs`, `.two-col`, `.verify`, `.wide`. Removing them is safe, but check every page at 1440px and 390px afterwards.

The older "bubble" button and card hover rules were replaced by the colour and underline rules above. If you find a rule that changes a background on hover for an ordinary link, it should be removed.
