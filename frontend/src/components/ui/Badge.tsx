import type { Severity } from '@/types'

const SEVERITY_STYLES: Record<Severity, string> = {
  P0: 'text-red-300 bg-red-300/5 border-red-300/20',
  P1: 'text-orange-300 bg-orange-300/5 border-orange-300/20',
  P2: 'text-yellow-300 bg-yellow-300/5 border-yellow-300/20',
  P3: 'text-blue-300 bg-blue-300/5 border-blue-300/20',
}

const SEVERITY_BG: Record<Severity, string> = {
  P0: 'bg-sev-critical',
  P1: 'bg-sev-high',
  P2: 'bg-sev-moderate',
  P3: 'bg-sev-stable',
}

interface BadgeProps {
  severity: Severity
  label?: string
  small?: boolean
}

/** Severity badge rendering a P0–P3 indicator with severity-specific color and vertical line tick. */
export function Badge({ severity, label, small = false }: BadgeProps) {
  const labelText = label ?? severity
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[2px] border px-1.5 py-0.5 font-mono font-medium tracking-wider ${
        small ? 'text-[10px]' : 'text-[11px]'
      } ${SEVERITY_STYLES[severity]}`}
    >
      <span className={`w-[3px] rounded-[1px] ${small ? 'h-[9px]' : 'h-[11px]'} ${SEVERITY_BG[severity]}`} />
      {labelText}
    </span>
  )
}
