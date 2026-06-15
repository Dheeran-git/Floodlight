# Floodlight — DESIGN.md

> **Based on the *WIRED* entry from the awesome-claude-design repo** (editorial tech-magazine:
> paper-white broadsheet density, custom serif display, mono uppercase kickers, a single
> ink-blue link accent) — adapted into an original system for **Floodlight**, an offline-first
> AI flood-response coordination platform. Design system name: **Floodlight Editorial**.
> Tagline: *Clarity when the water rises.*
>
> Surfaces: a 16:9 **pitch deck** (primary), a responder **command desk** (web), and a
> **citizen reporter** mobile PWA. The governing voice is **investigative journalism** — this
> looks like a serious longform report on urban flooding, not a dashboard demo. That credibility
> is the point.

---

## 1. Visual Theme & Atmosphere

Floodlight should feel like a **special print report** — a broadsheet investigation into a city that floods every monsoon. Calm, literate, evidence-driven, and human. The atmosphere is built almost entirely from **typography, black hairline rules, and warm paper**, not effects. No glows, no gradients, no dark "command center." Ink on paper does the work.

Density follows the newspaper logic: **narrative pages breathe** (one idea, big serif headline, generous margins) while **data pages pack tight** (ruled tables, multi-column, tabular figures). The mood is serious but not cold — warm paper and a humane editorial serif keep it on the side of the people in the story.

Color is **rationed like ink on a press**: the page is paper + black text, with exactly **one ink-blue accent** for links/actions and **one editorial vermillion** reserved for emphasis — big pull-stats and genuine urgency. When vermillion appears, it means something.

Keywords: *editorial, broadsheet, evidence-driven, literate, humane, credible, print-anchored.*

---

## 2. Color Palette & Roles

**Light is the primary (and default) theme.** A compact dark override is included for dim projection rooms only.

```css
:root {
  /* Paper & surfaces — warm broadsheet stock */
  --paper:        #F6F3EC;  /* app background, newsprint paper */
  --paper-raised: #FBFAF5;  /* raised sections, sidebars */
  --card:         #FFFFFF;  /* clean white insets, photo mounts, data cards */

  /* Ink (text) */
  --ink:          #16140F;  /* primary text, headlines — near-black, never pure #000 */
  --ink-2:        #3A362E;  /* secondary text, body de-emphasis */
  --ink-3:        #6B655A;  /* captions, metadata, muted */
  --ink-4:        #9A9384;  /* placeholders, disabled */

  /* Rules — the newspaper signature */
  --rule:         #16140F;  /* strong black hairline rules (section dividers, headers) */
  --rule-soft:    #DAD4C6;  /* soft hairline on paper (row dividers, card edges) */

  /* THE single accent — ink-blue (links + interactive, faithful to WIRED) */
  --accent:       #1B3FA0;
  --accent-press: #142F7A;
  --accent-tint:  rgba(27, 63, 160, 0.08);

  /* Editorial emphasis — vermillion (pull-stats, key numbers, urgency) */
  --emphasis:     #CC3B2B;
  --emphasis-tint:rgba(204, 59, 43, 0.08);

  /* Semantic / severity — muted "infographic" tones, not neon UI alerts */
  --sev-critical: #CC3B2B;  /* P0 — SOS, life threat, blocked road */
  --sev-high:     #C9711B;  /* P1 — urgent (ochre-orange) */
  --sev-moderate: #B0860F;  /* P2 — watch (goldenrod) */
  --sev-stable:   #2E7D5B;  /* P3 — stable / cleared (muted green) */
  --sev-info:     #1B3FA0;  /* informational (== accent) */

  /* Map / data-viz — muted blue depth ramp, reads as a printed infographic */
  --flood-1:      #CBD7EE;  /* shallow / low risk */
  --flood-2:      #93AEDC;
  --flood-3:      #5C84C8;
  --flood-4:      #2A4FA0;  /* deep / inundated */
  --route:        #1B3FA0;  /* optimized rescue route (ink-blue line) */
  --blocked:      #CC3B2B;  /* blocked roads (vermillion, dashed) */
  --marker-team:  #C9711B;  /* rescue team (ochre) */
  --marker-shelter:#2E7D5B; /* shelter (green) */
}
```

```css
/* Dark override — dim rooms only. Keep editorial: ink stock + paper text. */
[data-theme="dark"] {
  --paper:        #15140F;
  --paper-raised: #1D1B15;
  --card:         #211F18;
  --ink:          #F3EEE1;
  --ink-2:        #CDC6B5;
  --ink-3:        #978F7E;
  --ink-4:        #6A6354;
  --rule:         #F3EEE1;
  --rule-soft:    #34312A;
  --accent:       #8FB0FF;  /* link blue lifted for dark */
  --emphasis:     #FF6A55;
}
```

**Usage rules**
- ~90% of any surface is paper + ink. The accent and emphasis are signals, not décor.
- **Ink-blue = links & interactive only.** **Vermillion = emphasis & critical only.** Never swap or blend them.
- Severity tones are muted (printed-infographic feel) — never neon, never glowing.
- No gradients anywhere except the muted flood-depth map ramp. No purple. No drop-shadow glows.

---

## 3. Typography Rules

Three families, the classic broadsheet split: a serif for editorial voice, a Franklin-lineage sans for UI/body, a mono for kickers and data. All on Google Fonts — use directly, no substitution.

- **Display — `Newsreader`** (600 / 500, italic available). Headlines, pull-quotes, big stat numbers. A screen-tuned news serif with real editorial character and an optical-size axis; this is the magazine voice. Italic for emphasis and pull-quotes.
- **UI / Body — `Libre Franklin`** (400 / 500 / 600 / 700). Body copy, captions, labels, tables, buttons. A Franklin Gothic descendant — the quintessential newspaper sans. Highly legible, quietly authoritative, pairs naturally with the serif.
- **Kickers / Data — `Spline Sans Mono`** (500 / 400). Uppercase kickers, datelines, bylines, coordinates, timestamps, IDs, metrics. The mono is the "wire-service" texture.

```css
--font-display: 'Newsreader', Georgia, 'Times New Roman', serif;
--font-ui:      'Libre Franklin', Helvetica, Arial, sans-serif;
--font-mono:    'Spline Sans Mono', ui-monospace, monospace;
```

### Type scale

| Token | Size (UI) | Size (deck/16:9) | Family | Weight | Tracking | Line-height |
|---|---|---|---|---|---|---|
| pull-stat | 64px | 104–120px | Newsreader | 600 | -0.02em | 0.98 |
| display-xl | 52px | 84–92px | Newsreader | 600 | -0.01em | 1.04 |
| display-l | 38px | 56px | Newsreader | 600 | -0.01em | 1.08 |
| h1 | 30px | 38px | Newsreader | 600 | 0 | 1.15 |
| h2 | 23px | 28px | Newsreader | 600 | 0 | 1.2 |
| h3 | 18px | 21px | Libre Franklin | 700 | 0 | 1.3 |
| body-lg | 18px | 20px | Libre Franklin | 400 | 0 | 1.6 |
| body | 15px | 17px | Libre Franklin | 400 | 0 | 1.6 |
| small | 13px | 14px | Libre Franklin | 500 | 0 | 1.45 |
| kicker | 12px | 13px | Spline Sans Mono | 500 | +0.12em | 1.3 (UPPERCASE) |
| data | 13px | 15px | Spline Sans Mono | 400 | +0.01em | 1.4 |

**Rules**
- Headlines, pull-quotes, and big stats are **serif** (Newsreader). Body and UI are **sans** (Libre Franklin) — never set paragraphs in the serif.
- **Kickers are uppercase mono** with `+0.12em` tracking, in `--ink-3` (e.g. `URBAN FLOODING · BENGALURU`, `MODULE 03 / OPTIMIZATION`).
- **Links are ink-blue and underlined** (offset 2px). Emphasis numbers are vermillion.
- A **drop cap** (Newsreader, ~3 lines) is encouraged on the lead narrative slide.
- All figures use tabular numerals (`font-variant-numeric: tabular-nums`). Datelines/bylines render in mono like a real article (`BENGALURU — 18 MAY`).

---

## 4. Component Stylings

General: **square or near-square corners** (radius 0–4px — this is print, not a toy), **black hairline rules** as the primary structural device, flat surfaces. Transitions 120–160ms.

**Rules & dividers** — the workhorse. A `1px solid --rule` line under section headers and between major blocks; `1px solid --rule-soft` for table rows and card edges. A `3px solid` top rule can cap a feature block (broadsheet masthead device).

**Buttons**
- *Primary:* `--accent` fill, white text, radius 3px, Libre Franklin 600, height 42px (deck CTAs 48px). Hover → `--accent-press`. No shadow, no gradient.
- *Secondary:* paper fill, `1px solid --ink`, ink text. Hover → `--accent-tint`.
- *Link/tertiary:* ink-blue underlined text, no chrome (the default editorial action).
- *Critical (Dispatch):* `--emphasis` fill for irreversible emergency actions only.

**Inputs / Search / AI query desk**
- `--card` fill, `1px solid --rule-soft` (bottom border emphasized, like a form line), radius 3px, 15px Libre Franklin, placeholder `--ink-4`.
- Focus: border → `--accent`, subtle `--accent-tint` fill.
- The **AI query desk** input leads with a mono label `QUERY —` and a serif-italic placeholder: *"which shelter exceeds capacity next?"*

**Card / Feature block**
- `--card` on `--paper`, `1px solid --rule-soft`, radius 4px, padding 20–24px.
- Header: mono kicker + serif title + `1px --rule` divider beneath. Optional 3px top rule for "lead" cards.

**Severity tags** (small, set like a newspaper label)
- Uppercase mono 11–12px, 2px radius, `*-tint` background + solid colored left tick or text:
  `P0 SOS` (critical) · `P1 URGENT` (high) · `P2 WATCH` (moderate) · `STABLE` / `CLEARED` (stable) · `INFO` (info).

**Pull-stat block** (signature)
- Giant Newsreader number in `--emphasis` (e.g. **₹225 cr**, **210**), a mono kicker label above, a one-line serif caption below, a thin rule to the side. This is the emotional anchor of data slides.

**Pull-quote**
- Large Newsreader (often italic), a `3px solid --emphasis` left rule, attribution in mono below.

**Data table**
- Header row mono uppercase `--ink-3`; rows divided by `--rule-soft`; numbers right-aligned tabular; severity shown as a leading colored tick. Reads like a published data table.

**SOS / report item**
- A ruled list row (not a glowing card): leading severity tick, serif one-line summary (*"Elderly trapped, 2nd floor — Whitefield"*), then mono meta (`RPT-2048 · 12.97°N 77.59°E · T+04:12`) and a `Dispatch` link. Hairline rule between rows.

**Map (printed-infographic style)**
- Muted paper basemap, hairline roads, flood zones in the `--flood-*` ramp at ~70% opacity, ink-blue route lines, vermillion dashed blocked roads, ochre team ticks, green shelter ticks, serif place-labels. A boxed mono legend with rules. It should look like an infographic in a feature article.

**Navigation**
- Command desk: a left masthead column (`--paper-raised`), mono section labels, active item marked by a `2px --ink` left rule + bold. Top of page carries a **masthead band**: product wordmark in serif + a mono dateline/edition line, a `1px --rule` beneath.
- Deck: a thin top rule, mono running header (`FLOODLIGHT — OSC AI BUILD 1.0`) top-left, mono counter `03 / 12` top-right.

---

## 5. Layout Principles

- **8px spacing system** (4px sub-step): `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`.
- **Editorial 12-column grid**, 24px gutters. Narrative content sits in 6–8 columns with wide margins; data/tables may use the full 12 in multiple sub-columns. **Strict baseline alignment** — everything hangs off the grid like set type.
- **Deck (16:9):** 88px outer margins. Each slide: mono kicker top-left, optional mono dateline top-right, a big serif headline, a `1px --rule` divider, then the content. One idea per narrative slide; data slides may run denser. Counter `NN / 12` top-right.
- **Rhythm:** rules separate sections; whitespace separates ideas. Group tightly (8–12px), separate generously (32–48px).
- **Columns are encouraged** — a two-column "story + data" split reads as broadsheet and is very on-brand.

```css
--radius-xs: 2px;  --radius-sm: 3px;  --radius-md: 4px;  --radius-tag: 2px;
```

---

## 6. Depth & Elevation

This system is **flat — ink on paper**. Depth comes from rules, surface tone steps, and restraint, not shadow.

```css
--elev-card:   0 0 0 1px var(--rule-soft);            /* edge as a rule, not a shadow */
--elev-pop:    0 14px 36px -16px rgba(20,18,15,0.22); /* menus / modals only */
--elev-sticky: 0 1px 0 var(--rule);                   /* a sticky header's bottom rule */
```

- Surface hierarchy: `--paper` → `--paper-raised` (rails/sections) → `--card` (insets/tables). Each separated by a hairline rule.
- Shadows appear **only** on floating UI (dropdowns, modals) — and stay soft. Never on cards, never as glow.
- Modals: dim with `rgba(22,20,15,0.45)`, no blur or 1px max.

---

## 7. Do's and Don'ts

**Do**
- Build structure from **black hairline rules** and **mono kickers** — they carry the brand.
- Keep **one** ink-blue accent (links/actions) and **one** vermillion (emphasis/critical). Ration them.
- Set headlines, pull-quotes, and big stats in the **serif**; body and UI in the **sans**.
- Use **dateline/byline framing** and tabular data tables — lean into the "published report" feel.
- Let narrative slides breathe; let data slides run dense like a newspaper spread.

**Don't**
- No gradients, glows, neon, or dark "command-center" chrome. This is paper.
- No rounded "toy" corners — stay square (≤4px).
- Don't set body copy in the serif, and don't introduce a second accent hue.
- Don't use Inter/Roboto/Arial/system UI fonts — they break the editorial voice.
- Don't decorate with the severity colors; they encode state only.
- Don't over-animate — motion is a quiet page-turn, not ambiance.

---

## 8. Responsive Behavior

- **Breakpoints:** `sm 480 · md 768 · lg 1024 · xl 1280 · 2xl 1536`.
- **Citizen Reporter (mobile-first):** single column, 16px margins, **44×44px** min touch targets, a bottom-fixed `REPORT EMERGENCY` button (vermillion). Offline state shown as a ruled banner: mono `OFFLINE — REPORT QUEUED` with a `--sev-moderate` tick. Never a dead screen.
- **Command desk:** ≥1280 shows masthead + left rail + map + a right "wire" column (severity list / query desk). 1024–1280 collapses the rail to mono initials. <1024 stacks: map, then list as a sheet.
- **Deck:** fixed 16:9; provide a 1:1 export variant for social. Min 17px body on slides; verify contrast at projection distance. Honor `prefers-reduced-motion`.

---

## 9. Agent Prompt Guide

Paste these into Claude Design after the system scaffolds, to keep new screens on-system.

**Foundational**
> "Use the Floodlight Editorial design system (DESIGN.md), based on the WIRED editorial aesthetic. Light/paper theme. Newsreader for serif headlines/pull-quotes/stats, Libre Franklin for body & UI, Spline Sans Mono for uppercase kickers and data. Structure with black hairline rules; one ink-blue accent for links/actions; vermillion only for emphasis and critical state. Square corners, flat (no shadows/gradients/glows). Voice: serious investigative journalism."

**Slide deck (16:9)**
> "Generate a 16:9 editorial pitch slide: 88px margins, a mono uppercase kicker top-left, optional mono dateline top-right, a large Newsreader headline, a 1px black rule beneath it, then the content. One idea per narrative slide; data slides can run denser with ruled tables and a big vermillion pull-stat. Mono counter `NN / 12` top-right. Keep it paper-clean and literate."

**Command desk (web)**
> "Build the responder command desk as an editorial 'situation desk': a serif masthead with a mono dateline, a left rail of mono section labels, a printed-infographic map (muted paper basemap, hairline roads, flood zones in the blue depth ramp, ink-blue routes, vermillion dashed blocked roads, ochre team ticks, green shelter ticks, serif place-labels, a boxed mono legend), and a right 'wire' column with the severity list (ruled rows, leading severity ticks, mono IDs/coords) and the AI query desk."

**Citizen reporter (mobile PWA)**
> "Mobile-first emergency report flow: voice/text/image + GPS, 44px targets, a bottom-fixed vermillion REPORT EMERGENCY button, and a ruled OFFLINE — REPORT QUEUED banner. Reassuring, dead-simple, paper-clean."

**Components**
> "Create the pull-stat block, pull-quote, severity tags (P0–P3 / STABLE / INFO), ruled data table, ruled SOS report row, and map legend — all per DESIGN.md, using rules and type rather than shadows."

**Variants to request:** dark (dim-room) theme · compact vs. comfortable density · two-column story+data slide template · empty/loading/offline states.
