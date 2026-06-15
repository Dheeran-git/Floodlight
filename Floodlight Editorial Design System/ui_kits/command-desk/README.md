# Responder Command Desk — UI kit

The Floodlight **command desk** is the dispatcher's web surface, built as an editorial
"situation desk" — a serif masthead, a left rail of mono section labels, a printed-infographic
crisis map, and a right "wire" column with the live severity list and the AI query desk.

## Run
Open `index.html`. Designed for ≥1280px wide. Fills the viewport.

## Layout
```
┌──────────────────── Masthead (serif wordmark + mono dateline · 3px rule) ──────────────────┐
│ Left rail   │   Stat strip (vermillion pull-stats)                       │  Wire column     │
│ (mono nav,  │   ───────────────────────────────────────────────────────  │  INCOMING WIRE   │
│  2px ink    │   Crisis map — printed infographic                          │  ruled SOS rows  │
│  active     │   (flood zones · routes · blocked roads · teams · shelters) │  ───────────────  │
│  marker)    │   boxed mono legend · scale · compass                       │  AI query desk   │
└─────────────┴─────────────────────────────────────────────────────────────┴──────────────────┘
```

## Interactions
- **Select a report** — click a wire row *or* a map marker; the selection highlights in both
  (shared `selected` state, `Data.jsx`).
- **Dispatch** — "Dispatch" / "Dispatch SOS" raises a ruled confirmation toast (route + ETA).
- **AI query desk** — type a question (serif-italic placeholder) and send → a vermillion
  pull-answer with mono provenance.
- **Left rail** — mono sections, active item marked by a 2px ink left rule + bold.

## Files
| File | Role |
|---|---|
| `index.html` | Assembles the desk; app state (selection, dispatch toast). |
| `Primitives.jsx` | `FL` tokens, stroke `Icon`, `Kicker`, `SeverityTag`, `Button`. |
| `Data.jsx` | Shared `REPORTS` / `TEAMS` / `SHELTERS` (map coords + wire data). |
| `Chrome.jsx` | `Masthead`, `LeftRail`, `StatStrip`. |
| `CrisisMap.jsx` | The printed-infographic SVG basemap + boxed legend + scale/compass. |
| `Wire.jsx` | `ReportRow`, `QueryDesk`, `WireColumn`. |

## Notes
- The map is a **schematic data-viz infographic** (SVG), per DESIGN.md — not a slippy basemap.
  It is deliberately drawn as an editorial figure, the way a feature article would print one.
- Cosmetic recreation: dispatch, routing, and the AI answer are mocked.
