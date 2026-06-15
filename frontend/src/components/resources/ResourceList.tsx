import { Card, StatusIndicator } from '@/components/ui'
import type { StatusTone } from '@/components/ui'
import type { RescueUnit, UnitStatus } from '@/types'

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

/** Panel listing rescue units with their availability status in broadsheet style. */
export function ResourceList({ units, isLoading }: ResourceListProps) {
  return (
    <Card title={`Rescue Units (${units.length})`} kicker="RESOURCES">
      {isLoading && <p className="text-xs text-ink-3 font-mono animate-pulse">Loading…</p>}
      <ul className="-mx-4 border-t border-rule-soft mt-2">
        {units.map((unit) => (
          <li
            key={unit.id}
            className="flex items-center justify-between border-b border-rule-soft px-4 py-2.5 hover:bg-paper-raised transition-colors"
          >
            <div>
              <p className="font-ui text-[14px] font-semibold text-ink leading-tight">{unit.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-3 mt-0.5">
                <span>{unit.type}</span>
                <span> · CAP {unit.capacity}</span>
              </p>
            </div>
            <StatusIndicator tone={STATUS_TONE[unit.status]} label={unit.status} />
          </li>
        ))}
      </ul>
    </Card>
  )
}
