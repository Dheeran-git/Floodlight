import { Badge, Card } from '@/components/ui'
import { useIncidentStore } from '@/state'
import type { Incident } from '@/types'

interface IncidentListProps {
  incidents: Incident[]
  isLoading: boolean
}

/** Panel listing active incidents in an editorial wire format. */
export function IncidentList({ incidents, isLoading }: IncidentListProps) {
  const selectedId = useIncidentStore((state) => state.selectedIncidentId)
  const selectIncident = useIncidentStore((state) => state.selectIncident)
  const sorted = [...incidents].sort((a, b) => b.priority_score - a.priority_score)

  return (
    <Card title={`Incidents (${incidents.length})`} kicker="CRISIS WIRE">
      {isLoading && <p className="text-xs text-ink-3 font-mono animate-pulse">Loading…</p>}
      {!isLoading && sorted.length === 0 && (
        <p className="text-xs text-ink-3 font-mono">No active incidents.</p>
      )}
      <ul className="-mx-4 border-t border-rule-soft">
        {sorted.map((incident) => {
          const isSelected = selectedId === incident.id
          const hasCoords = typeof incident.latitude === 'number' && typeof incident.longitude === 'number'
          return (
            <li key={incident.id}>
              <button
                type="button"
                onClick={() => selectIncident(incident.id)}
                className={`flex w-full gap-3 px-4 py-3 border-b border-rule-soft cursor-pointer transition-colors select-none text-left ${
                  isSelected
                    ? 'border-amber-500/40 bg-amber-500/10 text-ink'
                    : 'border-transparent hover:bg-paper-raised text-ink-2'
                }`}
              >
                <div
                  className={`w-[3px] rounded-[1px] shrink-0 ${
                    incident.severity === 'P0'
                      ? 'bg-sev-critical'
                      : incident.severity === 'P1'
                        ? 'bg-sev-high'
                        : incident.severity === 'P2'
                          ? 'bg-sev-moderate'
                          : 'bg-sev-stable'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Badge severity={incident.severity} small />
                    <span className="font-mono text-[10.5px] text-ink-3 uppercase tracking-wide">
                      PRIORITY {incident.priority_score}
                    </span>
                  </div>
                  <div className="font-display text-[15.5px] font-semibold leading-snug text-ink mt-1.5 break-words">
                    {incident.title}
                  </div>
                  <div className="flex items-baseline justify-between mt-2 font-mono text-[10.5px] text-ink-3">
                    <span>
                      {incident.id.slice(0, 8)}
                      {hasCoords && ` · ${incident.latitude.toFixed(4)}°N, ${incident.longitude.toFixed(4)}°E`}
                    </span>
                    <span className="font-ui font-semibold text-accent underline underline-offset-2 hover:text-accent-press">
                      Dispatch
                    </span>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
