---
name: floodlight-design
description: Use this skill to generate well-branded interfaces and assets for Floodlight, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. Floodlight Editorial is a light, editorial/broadsheet design system for an offline-first AI flood-response platform (Bengaluru pilot) — serious investigative-journalism aesthetic, not a SaaS dashboard.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and
create static HTML files for the user to view. If working on production code, you can copy
assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or
design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_
production code, depending on the need.

## Quick orientation

**Floodlight Editorial** — *Clarity when the water rises.* Warm paper, near-black ink,
structured with black hairline rules and uppercase mono kickers. Color is **rationed like ink**:
one ink-blue accent (`#1B3FA0`) for links/actions, one vermillion (`#CC3B2B`) for pull-stats and
genuine urgency — never swap or blend them. Square corners (≤4px), completely flat (no shadows
on cards, no gradients except the muted flood-depth map ramp, no glows). Voice: serious
investigative journalism.

- **Tokens & fonts:** `colors_and_type.css` (import it). Newsreader (serif headlines/quotes/
  stats), Libre Franklin (body & UI), Spline Sans Mono (kickers/datelines/coords/data) — all
  Google Fonts, used directly. Never set body in the serif; never introduce a second accent.
- **Foundations & rules:** `README.md` — CONTENT FUNDAMENTALS (how copy is written),
  VISUAL FOUNDATIONS (color/type/spacing/motion/states), ICONOGRAPHY (Lucide stroke icons).
- **Specimens:** `preview/` — small cards for every color, type, spacing, component, brand token.
- **UI kits** (high-fidelity React/JSX recreations):
  - `ui_kits/citizen-reporter/` — mobile PWA emergency report flow.
  - `ui_kits/command-desk/` — responder web "situation desk" (masthead, crisis map, wire column).
- **Slides:** `slides/` — editorial 16:9 deck (`index.html` via `deck-stage.js`) + per-type
  standalone slides (Title, PullStat, TwoColumn, MapSlide, BigQuote).
- **Assets:** `assets/` — `floodlight-wordmark.svg`, `floodlight-mark.svg`.
- **Source of truth:** `uploads/DESIGN (1).md`.

## Working rules
- Build structure from **hairline rules** + **mono kickers**. Use datelines/bylines and ruled
  data tables — lean into the "published report" feel.
- Narrative surfaces breathe (one idea, big serif headline, wide margins); data surfaces run
  dense like a newspaper spread (ruled tables, tabular figures, a vermillion pull-stat).
- Reuse the JSX components in `ui_kits/` and the slide templates in `slides/` rather than
  rebuilding. Copy any assets you reference into your output folder.
- Don't: rounded toy corners, drop-shadow glows, dark "command-center" chrome, emoji,
  Inter/Roboto/Arial/system fonts, or decorating with the severity colors (they encode state).
