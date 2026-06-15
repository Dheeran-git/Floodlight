/** Visual tone of a status indicator dot. */
export type StatusTone = 'online' | 'busy' | 'offline' | 'warning'

const TONE_STYLES: Record<StatusTone, string> = {
  online: 'bg-green-400',
  busy: 'bg-amber-400',
  offline: 'bg-gray-500',
  warning: 'bg-red-400',
}

interface StatusIndicatorProps {
  tone: StatusTone
  label: string
  pulse?: boolean
}

/** Colored dot plus label used for connection and unit status. */
export function StatusIndicator({ tone, label, pulse = false }: StatusIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-gray-300">
      <span
        className={`h-2 w-2 rounded-full ${TONE_STYLES[tone]} ${pulse ? 'animate-pulse' : ''}`}
      />
      {label}
    </span>
  )
}
