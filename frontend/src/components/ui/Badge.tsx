import type { Severity } from '@/types'

/** Tailwind classes for each severity level (high contrast on dark theme). */
const SEVERITY_STYLES: Record<Severity, string> = {
  P0: 'bg-red-500/20 text-red-300 border-red-500/40',
  P1: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  P2: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  P3: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
}

interface BadgeProps {
  severity: Severity
  label?: string
}

/** Severity badge rendering a P0–P3 indicator with severity-specific color. */
export function Badge({ severity, label }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${SEVERITY_STYLES[severity]}`}
    >
      {label ?? severity}
    </span>
  )
}
