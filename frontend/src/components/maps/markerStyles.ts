import type { Severity, UnitStatus } from '@/types'

/** Marker dot background color per report/incident severity. */
export const SEVERITY_COLOR: Record<Severity, string> = {
  P0: 'bg-red-500',
  P1: 'bg-orange-500',
  P2: 'bg-yellow-400',
  P3: 'bg-blue-500',
}

/** Marker dot color per rescue unit status. */
export const UNIT_STATUS_COLOR: Record<UnitStatus, string> = {
  available: 'bg-green-400',
  assigned: 'bg-amber-400',
  en_route: 'bg-amber-400',
  on_scene: 'bg-cyan-400',
  returning: 'bg-gray-400',
}

/** Shelter dot color based on occupancy ratio. */
export function shelterColor(ratio: number): string {
  if (ratio >= 0.9) return 'bg-red-500'
  if (ratio >= 0.6) return 'bg-amber-500'
  return 'bg-green-500'
}

/** Build a styled circular marker element with the given Tailwind classes. */
export function createDot(colorClass: string, extra = ''): HTMLDivElement {
  const el = document.createElement('div')
  el.className =
    `h-3.5 w-3.5 rounded-full border-2 border-white/80 shadow-md ${colorClass} ${extra}`.trim()
  return el
}

/** Build a marker element with a ring (used for emphasized incidents). */
export function createPulseMarker(colorClass: string): HTMLDivElement {
  const wrap = document.createElement('div')
  wrap.className = 'relative flex h-5 w-5 items-center justify-center'
  const ring = document.createElement('span')
  ring.className = `absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${colorClass}`
  const core = document.createElement('span')
  core.className = `relative inline-flex h-3 w-3 rounded-full border border-white ${colorClass}`
  wrap.appendChild(ring)
  wrap.appendChild(core)
  return wrap
}

/** Translucent fill color for a forecasted risk zone by risk score (0-100). */
export function riskColor(score: number): string {
  if (score >= 80) return 'bg-red-500/30 border-red-400'
  if (score >= 60) return 'bg-orange-500/30 border-orange-400'
  if (score >= 40) return 'bg-yellow-400/30 border-yellow-300'
  return 'bg-blue-500/25 border-blue-400'
}

/** Build a large translucent disc element representing a risk zone area. */
export function createRiskZone(colorClass: string): HTMLDivElement {
  const el = document.createElement('div')
  el.className = `h-12 w-12 rounded-full border ${colorClass}`.trim()
  return el
}

/** Build popup HTML for a key/value summary (values are escaped). */
export function popupHtml(title: string, rows: Array<[string, string]>): string {
  const escape = (s: string) =>
    s.replace(/[&<>"]/g, (c) => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
      }
      return map[c]
    })
  const body = rows
    .map(
      ([k, v]) =>
        `<div style="display:flex;gap:6px"><span style="color:#9ca3af">${escape(
          k,
        )}</span><span style="color:#e5e7eb">${escape(v)}</span></div>`,
    )
    .join('')
  return `<div style="font-size:12px;min-width:140px"><div style="font-weight:600;color:#f3f4f6;margin-bottom:4px">${escape(
    title,
  )}</div>${body}</div>`
}
