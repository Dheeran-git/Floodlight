# Floodlight Editorial — Design System

> *Clarity when the water rises.*

Floodlight is an **offline-first AI flood-response coordination platform** for emergency
teams during urban floods, piloting in **Bengaluru**. This repository is its design system —
**Floodlight Editorial** — the brand foundations, components, UI kits, and sample slides that
keep every surface on-system.

The governing voice is **investigative journalism**. Floodlight should look like a serious
longform report on urban flooding — a special print broadsheet — not a SaaS dashboard or a
dark "command center." That credibility is the product's whole point: calm, literate,
evidence-driven, humane.

---

## Product context & surfaces

Floodlight spans three surfaces, all built from the same editorial system:

1. **Pitch deck (16:9)** — *primary surface.* A literate investigative slide deck for funders,
   city partners, and press. See `slides/`.
2. **Responder command desk (web)** — an editorial "situation desk" for dispatchers: a serif
   masthead, a left rail of mono section labels, a printed-infographic crisis map, and a right
   "wire" column with the severity list and AI query desk. See `ui_kits/command-desk/`.
3. **Citizen reporter (mobile PWA)** — a dead-simple, reassuring emergency report flow for the
   public on degraded connectivity: voice / text / image + GPS, offline-queued, never a dead
   screen. See `ui_kits/citizen-reporter/`.

### Sources

- **`uploads/DESIGN (1).md`** — the source-of-truth brand spec (the *Floodlight — DESIGN.md*
  document). Everything here derives from it. Treat that file as canonical if anything conflicts.
- The aesthetic is adapted from the **WIRED** editorial entry of the *awesome-claude-design*
  reference (paper-white broadsheet density, custom serif display, mono uppercase kickers,
  one ink-blue link accent), reworked into an original system for Floodlight.
- **No codebase or Figma file was provided** — there are no external design URLs to access.
  This system is built entirely from the written spec.

---

## CONTENT FUNDAMENTALS — how Floodlight writes

The copy *is* the brand. Floodlight reads like a credible newsroom, not a product marketing site.

- **Voice:** investigative, literate, humane. Plain declarative sentences with real nouns.
  It states evidence and lets the gravity sit. Never hypey, never cute, never "delightful."
- **Tense & person:** third-person reportage for narrative ("By the time the official map
  updated, the water was at the second floor"). UI speaks plainly in **imperative** for actions
  (*Dispatch team*, *Mark cleared*, *Report emergency*). Avoid "we"/"our" cheerleading. Address
  the responder directly only in instructions.
- **Datelines & bylines:** real-article framing. Lead lines render in mono like wire copy —
  `BENGALURU — 18 MAY`, attributions as `R. IYER — WARD 174 VOLUNTEER COORDINATOR`.
- **Kickers** are uppercase mono, section/topic labels: `URBAN FLOODING · BENGALURU`,
  `MODULE 03 / OPTIMIZATION`. They orient the reader like a magazine standfirst.
- **Numbers carry the weight.** Big consequences are stated as pull-stats — `210 families`,
  `₹225 cr`, `38% fewer`. Tabular figures, never rounded into mush. A number in vermillion
  means *this matters.*
- **Casing:** Sentence case for headlines and body. UPPERCASE reserved for mono kickers,
  datelines, severity tags (`P0 SOS`, `STABLE`, `OFFLINE — REPORT QUEUED`) and button labels
  only where it reads as a label, not a shout.
- **Severity language** is terse and operational: `Elderly trapped, 2nd floor — Whitefield`.
  One line, the most important fact first, location last. No filler.
- **Emoji:** never. Unicode degree/cardinal marks for coordinates (`12.97°N`) are fine.
- **Tone in failure states:** reassuring and concrete, never alarming about the *app*.
  `OFFLINE — REPORT QUEUED` with a calm note that nothing is lost. The emergency is the only
  thing allowed to feel urgent.

**Vibe in one line:** a trustworthy field report written by people who are on the ground and
care about getting it right.

---

## VISUAL FOUNDATIONS

The atmosphere is built almost entirely from **typography, black hairline rules, and warm
paper** — not effects. Ink on paper does the work.

### Color
- ~**90% of any surface is paper + ink.** Warm broadsheet paper (`#F6F3EC`), near-black ink
  (`#16140F`, never pure black).
- **Exactly one accent — ink-blue `#1B3FA0`** — for links and interactive elements *only*.
- **Exactly one emphasis — vermillion `#CC3B2B`** — for big pull-stats and genuine urgency
  *only*. Color is **rationed like ink on a press**. Never swap or blend the two.
- **Severity tones** (critical/high/moderate/stable/info) are muted "printed-infographic"
  hues — never neon, never glowing. They **encode state**, never decorate.
- The only ramp anywhere is the muted **flood-depth map ramp** (`--flood-1..4`). No purple,
  no decorative gradients, ever.

### Typography
Classic broadsheet split across three Google Fonts (used directly, no substitution):
- **Newsreader** (serif) — headlines, pull-quotes, big stat numbers. The magazine voice.
  Italic for emphasis and pull-quotes. Never set body copy in the serif.
- **Libre Franklin** (Franklin-Gothic sans) — body, captions, labels, tables, buttons.
- **Spline Sans Mono** — uppercase kickers (`+0.12em` tracking), datelines, bylines,
  coordinates, timestamps, IDs, metrics. The "wire-service" texture.
- All figures use **tabular numerals**. A 3-line **drop cap** (Newsreader) is encouraged on
  the lead narrative slide. Full scale in `colors_and_type.css` and the Type cards.

### Spacing & layout
- **8px spacing system** (4px sub-step): 4·8·12·16·20·24·32·40·48·64·80·96.
- **Editorial 12-column grid**, 24px gutters. Narrative content sits in 6–8 columns with wide
  margins; data/tables may run the full 12. **Strict baseline alignment** — everything hangs
  off the grid like set type.
- **Rhythm:** rules separate *sections*; whitespace separates *ideas*. Group tightly (8–12px),
  separate generously (32–48px). Two-column "story + data" splits are very on-brand.
- Deck: fixed 16:9, **88px outer margins**, mono kicker top-left, optional dateline top-right,
  serif headline, `1px` rule, then content. Counter `NN / 12` top-right.

### Surfaces, borders & elevation
- **Backgrounds are flat warm paper** — no images behind text, no full-bleed photography by
  default, no textures, no repeating patterns, no gradients (except the map ramp).
- Surface hierarchy by tone step, each separated by a hairline rule:
  `--paper` → `--paper-raised` (rails/sections) → `--card` (insets/tables).
- **Rules are the primary structural device:** `1px solid --rule` under section headers and
  between major blocks; `1px solid --rule-soft` for table rows and card edges; a `3px solid`
  top rule caps a "lead" feature block (masthead device).
- **The system is flat.** A card's edge is a `0 0 0 1px --rule-soft` ring, *not* a shadow.
  Shadows appear **only** on floating UI (dropdowns, modals) and stay soft —
  `0 14px 36px -16px rgba(20,18,15,0.22)`. Never on cards, never as glow.
- **Corner radii are square-ish:** `2px` tags, `3px` buttons/inputs, `4px` cards. Max 4px.
  No rounded "toy" corners.

### Cards
A card is `--card` on `--paper` with a `1px solid --rule-soft` edge, `4px` radius, 20–24px
padding. Header = mono kicker + serif title + a `1px --rule` divider beneath. "Lead" cards add
a `3px` top rule. **No shadow, no colored left-border accent, no gradient fill.**

### Imagery
Imagery is rare and editorial when used: documentary, **warm-leaning**, treated like a printed
photo mounted on white (`--card`) with a hairline frame and a mono caption beneath — never
full-bleed behind text, never tinted or duotoned into decoration. The **map** is the main
"image," and it is rendered as a **printed infographic** (muted paper basemap, hairline roads,
flood zones at ~70% opacity, ink-blue routes, vermillion dashed blocked roads, ochre team ticks,
green shelter ticks, serif place-labels, a boxed mono legend) — not a slick interactive basemap.

### Motion
Motion is **a quiet page-turn, not ambiance.** Transitions 120–160ms, gentle ease
(`cubic-bezier(0.2,0,0,1)`). Fades and short slides only — no bounces, no spring, no parallax,
no looping ambient animation. Honor `prefers-reduced-motion`.

### Interaction states
- **Hover:** primary buttons darken to `--accent-press`; secondary buttons fill with
  `--accent-tint`; links shift to `--accent-press`. No scale-up, no glow.
- **Press:** color deepens (no shrink/scale gimmicks).
- **Focus:** input border → `--accent` with a subtle `--accent-tint` fill. Visible focus ring
  for keyboard users.
- **Disabled:** `--ink-4` text, no fill.
- **Transparency / blur:** essentially none. Modals dim with `rgba(22,20,15,0.45)` and at most
  a 1px blur. No frosted-glass panels, no backdrop blur as decoration.

---

## ICONOGRAPHY

No icon set ships with the spec, so the system standardizes on **Lucide** (`lucide.dev`) —
thin, single-weight, **stroke-only** geometric icons with no fill. This matches the restrained,
hairline-driven editorial feel far better than a filled or duotone set; a Lucide stroke reads
like a drawn rule, consistent with the brand's line work.

- **Loading:** link from CDN — `<script src="https://unpkg.com/lucide@latest"></script>` then
  `lucide.createIcons()`. In the UI kits, icons are inlined as Lucide SVG paths so the kits work
  offline.
- **Sizing & color:** 16–20px in UI at `1.75` stroke; color inherits `currentColor` (usually
  `--ink-2` / `--ink-3`). An icon may take `--accent` only when it labels an interactive control,
  or a severity color only when it encodes state.
- **Usage is sparing** — this is a typographic system. Common glyphs: `mic`, `camera`,
  `map-pin`, `search`, `menu`, `chevron-*`, `wifi-off` (offline), `triangle-alert` (severity),
  `radio` / `send` (dispatch), `check`. Prefer a mono **kicker** or a ruled label over an icon
  when a word will do.
- **Emoji:** never. **Unicode** is used only for typographic marks (`°`, `·`, `—`, `→`).
- **Brand marks:** `assets/floodlight-wordmark.svg` (serif logotype + edition line + rationed
  vermillion period) and `assets/floodlight-mark.svg` (serif **F** on ink with the vermillion
  floodline — app icon / favicon).

> ⚠️ **Substitution flag:** Lucide is a reasoned default, not specified in DESIGN.md. If
> Floodlight has (or wants) a bespoke icon set, drop the SVGs into `assets/icons/` and update
> this section — the system is built to use stroke icons either way.

---

## VISUAL ASSETS

In `assets/`:
- `floodlight-wordmark.svg` — primary logotype (serif "Floodlight", mono edition line, 3px
  masthead rule, vermillion period). Serif fallback baked in so it renders without webfonts.
- `floodlight-mark.svg` — square app mark / favicon (serif F on ink + vermillion floodline).

No photography was provided. When real documentary imagery becomes available, store it in
`assets/` and present it per the **Imagery** rules above (hairline-framed photo mounts with
mono captions).

---

## Index — what's in this system

| Path | What it is |
|---|---|
| `README.md` | This file — context, content & visual foundations, iconography, index. |
| `colors_and_type.css` | All design tokens (color, type, spacing, radii, elevation, motion) + semantic type classes + dark override. **Import this everywhere.** |
| `SKILL.md` | Agent-Skills manifest so this system can be used as a Claude skill. |
| `assets/` | Brand marks (wordmark, app mark). Add icons & photography here. |
| `preview/` | Design-system tab cards (Colors, Type, Spacing, Components, Brand specimens). |
| `ui_kits/citizen-reporter/` | Mobile PWA UI kit — emergency report flow. `index.html` + JSX components. |
| `ui_kits/command-desk/` | Responder command desk UI kit — situation desk. `index.html` + JSX components. |
| `slides/` | Editorial 16:9 sample deck — title, narrative, pull-stat, two-column, map, quote slides. |
| `uploads/DESIGN (1).md` | Original source-of-truth spec. |

### UI kits
- **Citizen Reporter** (`ui_kits/citizen-reporter/index.html`) — mobile-first report flow:
  triage → compose (voice/text/image + GPS) → offline-queued confirmation.
- **Command Desk** (`ui_kits/command-desk/index.html`) — masthead, left rail, printed crisis
  map, right "wire" column (severity list + AI query desk).

### Slides
`slides/index.html` — a deck-stage presentation of editorial slide templates.
