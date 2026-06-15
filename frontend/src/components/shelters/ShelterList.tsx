import { Card } from '@/components/ui'
import type { Shelter } from '@/types'

/** bar color based on occupancy ratio. */
function occupancyColor(ratio: number): string {
  if (ratio >= 0.9) return 'bg-red-500'
  if (ratio >= 0.6) return 'bg-amber-500'
  return 'bg-green-500'
}

/** Map an occupancy ratio to a fractional width class (percentage style). */
function occupancyWidth(ratio: number): string {
  const pct = Math.round(Math.min(Math.max(ratio, 0), 1) * 100)
  return `${pct}%`
}

interface ShelterListProps {
  shelters: Shelter[]
  isLoading: boolean
}

/** Panel listing shelters with a capacity utilization bar. */
export function ShelterList({ shelters, isLoading }: ShelterListProps) {
  return (
    <Card title={`Shelters (${shelters.length})`} kicker="LOGISTICS">
      {isLoading && <p className="text-xs text-ink-3 font-mono animate-pulse">Loading…</p>}
      <ul className="space-y-4 mt-2">
        {shelters.map((shelter) => {
          const ratio = shelter.capacity
            ? shelter.current_occupancy / shelter.capacity
            : 0
          return (
            <li key={shelter.id} className="block select-none">
              <div className="flex justify-between items-baseline">
                <span className="font-ui text-[14px] font-semibold text-ink">{shelter.name}</span>
                <span className="font-mono text-[11.5px] text-ink-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {shelter.current_occupancy}/{shelter.capacity}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-rule-soft rounded-[1px] overflow-hidden relative">
                <div
                  className={`h-full rounded-[1px] transition-all duration-300 ${occupancyColor(ratio)}${
                    ratio >= 1 ? ' w-full' : ratio <= 0 ? ' w-0' : ''
                  }`}
                  style={{ width: occupancyWidth(ratio) }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
