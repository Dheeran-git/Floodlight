import { StatusIndicator } from '@/components/ui'
import { useUiStore } from '@/state'
import type { ConnectionStatus } from '@/types'

const CONNECTION_TONE: Record<ConnectionStatus, 'online' | 'busy' | 'offline'> = {
  connected: 'online',
  connecting: 'busy',
  disconnected: 'offline',
}

/** Top application header with branding and live connection state. */
export function Header() {
  const connection = useUiStore((state) => state.connection)
  return (
    <header className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🔦</span>
        <span className="text-lg font-bold text-amber-400">Floodlight</span>
        <span className="hidden text-xs text-gray-500 sm:inline">
          Disaster Operations Copilot
        </span>
      </div>
      <StatusIndicator
        tone={CONNECTION_TONE[connection]}
        label={connection}
        pulse={connection === 'connecting'}
      />
    </header>
  )
}
