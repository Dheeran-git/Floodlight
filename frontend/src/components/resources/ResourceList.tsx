import { Card, StatusIndicator } from '@/components/ui'
import type { StatusTone } from '@/components/ui'
import type { RescueUnit, UnitStatus } from '@/types'

/** Map unit status to an indicator tone. */
const STATUS_TONE: Record<UnitStatus, StatusTone> = {
  available: 'online',
  assigned: 'busy',
  en_route: 'busy',
  on_scene: 'busy',
  returning: 'offline',
}

interface ResourceListProps {
  units: RescueUnit[]
  isLoading: boolean
}

/** Panel listing rescue units with their availability status. */
export function ResourceList({ units, isLoading }: ResourceListProps) {
  return (
    <Card title={`Rescue Units (${units.length})`}>
      {isLoading && <p className="text-xs text-gray-500">Loading…</p>}
      <ul className="space-y-2">
        {units.map((unit) => (
          <li
            key={unit.id}
            className="flex items-center justify-between rounded border border-gray-800 px-2 py-1.5"
          >
            <div>
              <p className="text-sm text-gray-200">{unit.name}</p>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">
                {unit.type}
              </p>
            </div>
            <StatusIndicator tone={STATUS_TONE[unit.status]} label={unit.status} />
          </li>
        ))}
      </ul>
    </Card>
  )
}
