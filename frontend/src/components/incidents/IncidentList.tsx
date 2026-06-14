import { Badge, Card } from '@/components/ui'
import { useIncidentStore } from '@/state'
import type { Incident } from '@/types'

interface IncidentListProps {
  incidents: Incident[]
  isLoading: boolean
}

/** Panel listing active incidents, sorted by priority, with selection. */
export function IncidentList({ incidents, isLoading }: IncidentListProps) {
  const selectedId = useIncidentStore((state) => state.selectedIncidentId)
  const selectIncident = useIncidentStore((state) => state.selectIncident)
  const sorted = [...incidents].sort((a, b) => b.priority_score - a.priority_score)

  return (
    <Card title={`Incidents (${incidents.length})`}>
      {isLoading && <p className="text-xs text-gray-500">Loading…</p>}
      {!isLoading && sorted.length === 0 && (
        <p className="text-xs text-gray-500">No active incidents.</p>
      )}
      <ul className="space-y-2">
        {sorted.map((incident) => (
          <li key={incident.id}>
            <button
              type="button"
              onClick={() => selectIncident(incident.id)}
              className={`flex w-full items-center justify-between rounded border px-2 py-1.5 text-left transition-colors ${
                selectedId === incident.id
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : 'border-gray-800 hover:bg-gray-800/50'
              }`}
            >
              <Badge severity={incident.severity} />
              <span className="text-xs text-gray-400">
                priority {incident.priority_score}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
