# Citizen Reporter — UI kit

The Floodlight **citizen reporter** is a mobile-first PWA for the public to submit emergency
reports during a flood, on degraded connectivity. Editorial paper aesthetic, dead-simple flow,
reassuring failure states — *never a dead screen*.

## Run
Open `index.html`. The screen mounts inside an iOS device frame (scaled to fit the viewport).

## Flow (click-through)
`Home → Triage → Compose → Queued`

1. **Home** — masthead, offline banner, a short serif intro, a ruled "near you" list of active
   reports, and the bottom-fixed **vermillion REPORT EMERGENCY** button.
2. **Triage** — "What's happening?" Four ruled severity choices (P0 / P1 / P2 / INFO), each a
   serif label with a colored tick.
3. **Compose** — segmented **Voice / Text / Photo** capture, an auto-attached **GPS** card with
   a green lock state, and a vermillion **SUBMIT REPORT** button.
4. **Queued** — green check, "Report queued", and a ruled **receipt** (report ID, coords,
   capture time, `QUEUED` status) explaining nothing is lost offline.

## Files
| File | Role |
|---|---|
| `index.html` | Mounts the device + app; fit-to-viewport scaling. |
| `ios-frame.jsx` | Starter device bezel (status bar, island, home indicator). Editorial chrome is built *inside* — the kit does not use the iOS nav bar / glass pills. |
| `Primitives.jsx` | `FL` tokens, Lucide-style stroke `Icon`, `Kicker`, `SeverityTag`, `EmergencyButton`. |
| `CitizenReporter.jsx` | `Masthead`, `OfflineBanner`, `HomeScreen`, `TriageScreen`, `ComposeScreen`, `QueuedScreen`, `CitizenApp`. |

## Notes
- Icons are inlined Lucide-style strokes (offline-safe). See README → ICONOGRAPHY.
- This is a cosmetic recreation: recording, GPS, and upload are mocked.
