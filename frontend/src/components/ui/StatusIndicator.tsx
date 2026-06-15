export type StatusTone = 'online' | 'busy' | 'offline' | 'warning'

const TONE_STYLES: Record<StatusTone, string> = {
  online: 'bg-green-400 text-sev-stable',
  busy: 'bg-amber-400 text-sev-high',
  offline: 'bg-gray-500 text-ink-3',
  warning: 'bg-red-400 text-sev-critical',
}

const TONE_DOT_BG: Record<StatusTone, string> = {
  online: 'bg-sev-stable',
  busy: 'bg-sev-high',
  offline: 'bg-ink-3',
  warning: 'bg-sev-critical',
}

interface StatusIndicatorProps {
  tone: StatusTone
  label: string
  pulse?: boolean
}

/** Colored dot plus label matching the broadsheet status indicators. */
export function StatusIndicator({ tone, label, pulse = false }: StatusIndicatorProps) {
  const dotClass = TONE_STYLES[tone].split(' ')[0]
  const textClass = TONE_STYLES[tone].split(' ')[1]
  const dotColor = TONE_DOT_BG[tone]

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wide uppercase ${textClass}`}>
      <span
        className={`h-[7px] w-[7px] rounded-full ${dotClass} ${dotColor} ${
          pulse ? 'animate-pulse' : ''
        }`}
      />
      {label}
    </span>
  )
}
