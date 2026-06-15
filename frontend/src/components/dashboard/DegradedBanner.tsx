/** Banner shown when the dashboard is offline / disconnected from the backend. */
export function DegradedBanner() {
  return (
    <div className="flex items-center gap-3 bg-paper-raised border-b border-rule-soft border-l-3 border-l-sev-moderate px-5 py-2.5">
      <svg
        className="text-sev-moderate shrink-0"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.5" />
        <path d="M5 12.5a10.94 10.94 0 0 1 5.83-2.84" />
        <path d="M8.53 16.03a6 6 0 0 1 7 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <div className="flex-1 text-left">
        <span className="font-mono text-[11px] font-semibold tracking-wide text-ink mr-2">
          OFFLINE — DEGRADED MODE:
        </span>
        <span className="font-ui text-[12px] text-ink-2">
          Connection lost. Showing cached database snapshot. Live synchronization is suspended.
        </span>
      </div>
    </div>
  )
}
