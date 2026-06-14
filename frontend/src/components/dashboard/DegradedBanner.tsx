/** Banner shown when the dashboard is offline / disconnected from the backend. */
export function DegradedBanner() {
  return (
    <div className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-xs font-medium text-amber-300">
      Degraded mode — connection lost. Showing last known data; updates are
      paused until reconnected.
    </div>
  )
}
